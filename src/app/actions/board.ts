"use server"

import { redirect } from "next/navigation"
import { getBoards, saveBoards, Board } from "@/lib/db"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import fs from "fs"
import path from "path"

// Initialize Supabase conditionally (checks if credentials exist)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabaseClient = () => {
  if (supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return null
}

// Helpers to format and map database objects to application interfaces
function formatLastEdited(timestamp: string): string {
  if (!timestamp) return "Last edited just now"
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (60 * 1000))
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

    if (diffMins < 1) return "Last edited just now"
    if (diffMins < 60) return `Last edited ${diffMins}m ago`
    if (diffHours < 24) return `Last edited ${diffHours}h ago`
    if (diffDays === 1) return "Last edited yesterday"
    return `Last edited ${diffDays} days ago`
  } catch (e) {
    return "Last edited just now"
  }
}

function mapDbBoardToAppBoard(dbBoard: any): Board {
  return {
    id: dbBoard.id,
    title: dbBoard.name, // db name -> app title
    lastEdited: formatLastEdited(dbBoard.updated_at || dbBoard.created_at),
    template: dbBoard.template,
    createdAt: dbBoard.created_at,
    data: dbBoard.data || [],
  }
}

export async function getBoardsAction() {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      // 1. Fetch boards owned by the user
      const { data: ownedBoards, error: ownedError } = await supabase
        .from("boards")
        .select("*")
        .eq("owner_id", userId)

      // 2. Fetch board IDs where user is a collaborator
      const { data: collabRelations, error: collabError } = await supabase
        .from("board_collaborators")
        .select("board_id")
        .eq("user_id", userId)

      let collaboratedBoards: any[] = []
      if (collabRelations && collabRelations.length > 0) {
        const boardIds = collabRelations.map((r) => r.board_id)
        const { data: collabs, error: collabsError } = await supabase
          .from("boards")
          .select("*")
          .in("id", boardIds)
        if (collabs) collaboratedBoards = collabs
      }

      // Merge and remove duplicates
      const allBoardsMap = new Map<string, any>()
      if (ownedBoards) {
        ownedBoards.forEach((b) => allBoardsMap.set(b.id, b))
      }
      collaboratedBoards.forEach((b) => allBoardsMap.set(b.id, b))

      // Convert to array and sort by updated_at descending
      const sortedBoards = Array.from(allBoardsMap.values()).sort(
        (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
      )

      return sortedBoards.map(mapDbBoardToAppBoard)
    } catch (e) {
      console.error("Supabase getBoardsAction failed, falling back to local storage", e)
    }
  }
  
  // Local JSON File Fallback
  return getBoards()
}

export async function createBoardAction(name: string, template: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const title = name.trim() || "Untitled Board"
  const newId = `board-${Date.now()}`
  
  const newBoard = {
    id: newId,
    name: title,
    owner_id: userId,
    template: template,
    data: [],
    thumbnail_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  let redirectUrl = ""
  
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { error } = await supabase.from("boards").insert([newBoard])
      if (!error) {
        redirectUrl = `/board/${newId}`
      } else {
        console.error("Supabase insert error", error)
      }
    } catch (e) {
      console.error("Supabase createBoardAction failed, falling back to local storage", e)
    }
  }
  
  // Fallback to local storage if not redirected by Supabase
  if (!redirectUrl) {
    const localBoard: Board = {
      id: newId,
      title,
      lastEdited: "Last edited just now",
      template: template,
      createdAt: new Date().toISOString(),
      data: [],
    }
    const boards = getBoards()
    boards.unshift(localBoard)
    saveBoards(boards)
    redirectUrl = `/board/${newId}`
  }
  
  redirect(redirectUrl)
}

export async function getBoardByIdAction(id: string) {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("id", id)
        .single()
      if (!error && data) return mapDbBoardToAppBoard(data)
    } catch (e) {
      console.error("Supabase getBoardByIdAction failed, falling back", e)
    }
  }
  
  const boards = getBoards()
  return boards.find((b) => b.id === id) || null
}

export async function saveBoardDataAction(boardId: string, shapesData: any[]) {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { error } = await supabase
        .from("boards")
        .update({ data: shapesData, updated_at: new Date().toISOString() })
        .eq("id", boardId)
      if (!error) return { success: true, provider: "supabase" }
    } catch (e) {
      console.error("Supabase saveBoardDataAction failed, falling back", e)
    }
  }
  
  // Local JSON File Fallback
  const boards = getBoards()
  const updated = boards.map((b) =>
    b.id === boardId ? { ...b, data: shapesData, lastEdited: "Last edited just now" } : b
  )
  saveBoards(updated)
  
  return { success: true, provider: "local" }
}

export async function renameBoardAction(boardId: string, newName: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const trimmedName = newName.trim() || "Untitled Board"
  const supabase = getSupabaseClient()
  
  if (supabase) {
    try {
      const { error } = await supabase
        .from("boards")
        .update({ name: trimmedName, updated_at: new Date().toISOString() })
        .eq("id", boardId)
      
      if (!error) return { success: true }
      console.error("Supabase rename error", error)
    } catch (e) {
      console.error("Supabase renameBoardAction failed, falling back", e)
    }
  }

  // Local JSON File Fallback
  const boards = getBoards()
  const updated = boards.map((b) =>
    b.id === boardId ? { ...b, title: trimmedName, lastEdited: "Last edited just now" } : b
  )
  saveBoards(updated)
  return { success: true }
}

export async function deleteBoardAction(boardId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { error } = await supabase
        .from("boards")
        .delete()
        .eq("id", boardId)
      
      if (!error) return { success: true }
      console.error("Supabase delete error", error)
    } catch (e) {
      console.error("Supabase deleteBoardAction failed, falling back", e)
    }
  }

  // Local JSON File Fallback
  const boards = getBoards()
  const filtered = boards.filter((b) => b.id !== boardId)
  saveBoards(filtered)
  return { success: true }
}

export async function uploadBoardImageAction(boardId: string, formData: FormData) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file uploaded")

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const buffer = await file.arrayBuffer()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const { data, error } = await supabase.storage
        .from("board-images")
        .upload(`${boardId}/${fileName}`, buffer, {
          contentType: file.type,
          upsert: true,
        })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from("board-images")
        .getPublicUrl(`${boardId}/${fileName}`)

      return { success: true, url: publicUrl }
    } catch (e) {
      console.error("Supabase upload failed, falling back to local storage", e)
    }
  }

  // Fallback: Write file locally to public/uploads/[boardId]
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), "public", "uploads", boardId)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)
    return { success: true, url: `/uploads/${boardId}/${fileName}` }
  } catch (e) {
    console.error("Local file upload fallback failed, falling back to base64 Data URL", e)
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`
    return { success: true, url: dataUrl }
  }
}
