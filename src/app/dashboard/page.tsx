"use client"

import * as React from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getBoardsAction,
  createBoardAction,
  renameBoardAction,
  deleteBoardAction,
} from "@/app/actions/board"

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = React.useState("My Boards")

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newBoardName, setNewBoardName] = React.useState("")
  const [selectedTemplate, setSelectedTemplate] = React.useState("blank")

  // Board mutations state
  const [activeMenuBoardId, setActiveMenuBoardId] = React.useState<string | null>(null)
  const [isRenameOpen, setIsRenameOpen] = React.useState(false)
  const [renameBoardId, setRenameBoardId] = React.useState("")
  const [renameBoardName, setRenameBoardName] = React.useState("")
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deleteBoardId, setDeleteBoardId] = React.useState("")
  const [deleteBoardName, setDeleteBoardName] = React.useState("")

  // Boards state
  const [boards, setBoards] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    getBoardsAction().then((data) => {
      setBoards(data)
      setIsLoading(false)
    })
  }, [])

  React.useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuBoardId(null)
    }
    window.addEventListener("click", handleGlobalClick)
    return () => window.removeEventListener("click", handleGlobalClick)
  }, [])

  const handleCreateBoard = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await createBoardAction(newBoardName, selectedTemplate)
    } catch (e) {
      console.error("Failed to create board", e)
      setIsSubmitting(false)
    }
  }

  const handleRenameBoard = async () => {
    if (!renameBoardId || !renameBoardName.trim()) return
    try {
      await renameBoardAction(renameBoardId, renameBoardName)
      setBoards((prev) =>
        prev.map((b) => (b.id === renameBoardId ? { ...b, title: renameBoardName } : b))
      )
      setIsRenameOpen(false)
      setRenameBoardId("")
      setRenameBoardName("")
    } catch (e) {
      console.error("Rename failed", e)
    }
  }

  const handleDeleteBoard = async () => {
    if (!deleteBoardId) return
    try {
      await deleteBoardAction(deleteBoardId)
      setBoards((prev) => prev.filter((b) => b.id !== deleteBoardId))
      setIsDeleteOpen(false)
      setDeleteBoardId("")
      setDeleteBoardName("")
    } catch (e) {
      console.error("Delete failed", e)
    }
  }

  // Previews based on selected template
  const renderBoardPreview = (template: string, title: string) => {
    switch (template) {
      case "mindmap":
        return (
          <svg className="w-full h-full text-indigo-400/80 dark:text-indigo-500/50" viewBox="0 0 200 120" fill="none">
            <circle cx="100" cy="60" r="16" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
            <text x="100" y="64" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">{title}</text>
            <circle cx="40" cy="35" r="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="40" y="38" fontSize="5" textAnchor="middle" fill="currentColor">Goals</text>
            <circle cx="160" cy="35" r="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="160" y="38" fontSize="5" textAnchor="middle" fill="currentColor">Metrics</text>
            <circle cx="50" cy="85" r="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="50" y="88" fontSize="5" textAnchor="middle" fill="currentColor">Execution</text>
            <circle cx="150" cy="85" r="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="150" y="88" fontSize="5" textAnchor="middle" fill="currentColor">Resources</text>
            <path d="M 84 52 L 52 41" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 116 52 L 148 41" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 87 68 L 61 80" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 113 68 L 139 80" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
        )
      case "wireframe":
        return (
          <svg className="w-full h-full text-indigo-400/80 dark:text-indigo-500/50" viewBox="0 0 200 120" fill="none">
            <rect x="25" y="20" width="40" height="80" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" />
            <line x1="30" y1="35" x2="60" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="50" x2="55" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="30" y1="60" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="30" y1="70" x2="58" y2="70" stroke="currentColor" strokeWidth="1" />
            <rect x="80" y="20" width="40" height="80" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" />
            <line x1="85" y1="35" x2="115" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="85" y1="50" x2="110" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="85" y1="60" x2="105" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="85" y1="70" x2="112" y2="70" stroke="currentColor" strokeWidth="1" />
            <rect x="135" y="20" width="40" height="80" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" />
            <line x1="140" y1="35" x2="170" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="140" y1="50" x2="165" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="140" y1="60" x2="160" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="140" y1="70" x2="168" y2="70" stroke="currentColor" strokeWidth="1" />
          </svg>
        )
      case "flowchart":
        return (
          <svg className="w-full h-full text-indigo-400/80 dark:text-indigo-500/50" viewBox="0 0 200 120" fill="none">
            <rect x="15" y="45" width="30" height="20" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
            <text x="30" y="57" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">Start</text>
            <path d="M 45 55 L 65 55" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
            <rect x="65" y="45" width="30" height="20" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="80" y="57" fontSize="5" textAnchor="middle" fill="currentColor">Sign In</text>
            <path d="M 95 55 L 115 55" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
            <polygon points="130,40 145,55 130,70 115,55" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="130" y="57" fontSize="4" textAnchor="middle" fill="currentColor">Verified?</text>
            <path d="M 130 40 L 130 25 L 155 25" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
            <path d="M 130 70 L 130 85 L 155 85" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
            <rect x="155" y="15" width="30" height="20" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="170" y="27" fontSize="5" textAnchor="middle" fill="currentColor">Success</text>
            <rect x="155" y="75" width="30" height="20" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
            <text x="170" y="87" fontSize="5" textAnchor="middle" fill="currentColor">Error</text>
          </svg>
        )
      case "sprint":
        return (
          <svg className="w-full h-full text-indigo-400/80 dark:text-indigo-500/50" viewBox="0 0 200 120" fill="none">
            <g transform="rotate(-3, 60, 45)">
              <rect x="40" y="25" width="40" height="40" rx="1.5" fill="#fef08a" stroke="#facc15" strokeWidth="0.8" />
              <line x1="45" y1="33" x2="75" y2="33" stroke="#854d0e" strokeWidth="1.5" />
              <line x1="45" y1="43" x2="70" y2="43" stroke="#854d0e" strokeWidth="1" />
              <line x1="45" y1="51" x2="65" y2="51" stroke="#854d0e" strokeWidth="1" />
            </g>
            <g transform="rotate(4, 115, 60)">
              <rect x="95" y="40" width="40" height="40" rx="1.5" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="0.8" />
              <line x1="100" y1="48" x2="130" y2="48" stroke="#1e3a8a" strokeWidth="1.5" />
              <line x1="100" y1="58" x2="125" y2="58" stroke="#1e3a8a" strokeWidth="1" />
              <line x1="100" y1="66" x2="120" y2="66" stroke="#1e3a8a" strokeWidth="1" />
            </g>
            <g transform="rotate(-6, 140, 35)">
              <rect x="120" y="20" width="38" height="38" rx="1.5" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.8" />
              <line x1="125" y1="28" x2="153" y2="28" stroke="#831843" strokeWidth="1.5" />
              <line x1="125" y1="36" x2="148" y2="36" stroke="#831843" strokeWidth="1" />
            </g>
          </svg>
        )
      case "blank":
      default:
        return (
          <svg className="w-full h-full text-indigo-400/80 dark:text-indigo-500/50" viewBox="0 0 200 120" fill="none">
            <rect x="20" y="20" width="160" height="80" rx="4" fill="currentColor" fillOpacity="0.02" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 40 40 Q 80 80, 120 40 T 160 80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,4" />
            <circle cx="40" cy="40" r="3" fill="currentColor" />
            <circle cx="160" cy="80" r="3" fill="currentColor" />
          </svg>
        )
    }
  }

  // Fallback defaults for user profile details if Clerk is loading or not signed in
  const userImageUrl = user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  const userFullName = user?.fullName || "Alex Rivera"
  const userEmail = user?.primaryEmailAddress?.emailAddress || "alex@rivera.com"

  return (
    <div className="flex h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950/50 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col justify-between p-6">
        <div className="flex flex-col gap-6">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.88 3.549L5.804 14.624a1.5 1.5 0 00-.398.67l-1.002 3.829a.5.5 0 00.612.612l3.829-1.002a1.5 1.5 0 00.67-.398L20.45 7.12a2.25 2.25 0 10-3.57-3.57z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.5L15.5 4.5" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                Whiteboard Pro
              </h2>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                Creative Team
              </p>
            </div>
          </div>

          {/* New Board Action Button */}
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>New Board</span>
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-2">
            {[
              {
                name: "My Boards",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ),
                href: "/dashboard",
              },
              {
                name: "Shared with Me",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                href: "/dashboard/share-with-me",
              },
              {
                name: "Templates",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                href: "/dashboard/templates",
              },
              {
                name: "Trash",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ),
                href: "/dashboard/trash",
              },
              {
                name: "Settings",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                href: "/settings",
              },
            ].map((item) => {
              const isActive = activeTab === item.name
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE BADGE (Replaces Storage) */}
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 shadow-inner">
                {isLoaded ? (
                  <img src={userImageUrl} alt="User profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                )}
              </div>

              {/* Identity Details */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                  {isLoaded ? userFullName : "Loading User..."}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                  {isLoaded ? userEmail : "Loading email..."}
                </span>
              </div>
            </div>
            
            {/* Plan Badge */}
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-medium flex-shrink-0 self-center">
              Pro Plan
            </span>
          </div>

          {/* Action Row: Theme Toggle + Log Out */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <ModeToggle />
            
            <SignOutButton>
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-200/80 dark:border-zinc-800/80 px-8 flex items-center justify-between bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
          {/* Search bar */}
          <div className="relative max-w-xl w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search boards, templates, and people..."
              className="w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80 dark:focus:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800/70 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <button className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer relative shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Bell active indicator dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-zinc-950" />
            </button>

            {/* Help Question mark */}
            <button className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Settings Gear */}
            <button className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA WITH DOTS GRID */}
        <div className="flex-1 overflow-y-auto px-8 py-6 dot-grid flex flex-col justify-between relative">
          
          <div className="flex flex-col">
            {/* Dashboard Sub-Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  My Boards
                </h1>
                <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 mt-1">
                  Last worked on boards for the Creative Team
                </p>
              </div>

              {/* View & Filter Actions */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                  </svg>
                  <span>Filter</span>
                </button>
                
                <button className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              
              {/* Create First Board (Dashed Card) */}
              <div
                onClick={() => setIsDialogOpen(true)}
                className="group border-2 border-dashed border-zinc-200 hover:border-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-500/80 bg-white/40 hover:bg-white/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-900/30 rounded-2xl h-56 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 group-hover:bg-indigo-100 group-hover:scale-110 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-zinc-650 group-hover:text-indigo-650 dark:text-zinc-400 dark:group-hover:text-indigo-400 transition-all duration-300">
                  Create your first board
                </span>
              </div>

              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm h-56 flex flex-col justify-between animate-pulse">
                    <div className="h-36 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800/80" />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="h-4 bg-zinc-150 dark:bg-zinc-850 rounded w-2/3" />
                      <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : (
                boards.map((board) => (
                  <Link href={`/board/${board.id}`} key={board.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex flex-col justify-between h-56 cursor-pointer relative">
                    {/* SVG Mockup Preview */}
                    <div className="h-36 bg-[#f7f8fa] dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center p-4 relative group-hover:opacity-95 transition-opacity">
                      {renderBoardPreview(board.template, board.title)}
                    </div>
                    {/* Board Info */}
                    <div className="p-4 flex items-center justify-between gap-2 relative">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          {board.title}
                        </span>
                        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1">
                          {board.lastEdited}
                        </span>
                      </div>
                      
                      {/* Actions Trigger Button */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setActiveMenuBoardId(activeMenuBoardId === board.id ? null : board.id)
                          }}
                          className="p-1.5 rounded-lg border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300 transition-all cursor-pointer shadow-none hover:shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                        
                        {/* Floating Actions Menu */}
                        {activeMenuBoardId === board.id && (
                          <div className="absolute right-0 bottom-full mb-1.5 z-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1 flex flex-col min-w-[120px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setRenameBoardId(board.id)
                                setRenameBoardName(board.title)
                                setIsRenameOpen(true)
                                setActiveMenuBoardId(null)
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold text-zinc-700 hover:bg-zinc-55 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDeleteBoardId(board.id)
                                setDeleteBoardName(board.title)
                                setIsDeleteOpen(true)
                                setActiveMenuBoardId(null)
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}

            </div>

            {/* Recommended Templates Section */}
            <div className="flex flex-col mb-16">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Recommended Templates
                </h3>
                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>View all</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Templates Horizontal Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Template 1: Kanban Board */}
                <div className="group flex items-center gap-4 p-4 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900 rounded-xl hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                      Kanban Board
                    </h4>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Manage team tasks
                    </p>
                  </div>
                </div>

                {/* Template 2: Brainstorming */}
                <div className="group flex items-center gap-4 p-4 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900 rounded-xl hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-650 dark:group-hover:text-amber-400 transition-colors">
                      Brainstorming
                    </h4>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Idea generation session
                    </p>
                  </div>
                </div>

                {/* Template 3: Journey Map */}
                <div className="group flex items-center gap-4 p-4 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900 rounded-xl hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                      Journey Map
                    </h4>
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Understand your users
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* FLOATING ACTION TOOLBAR AT BOTTOM CENTER */}
          <div className="sticky bottom-4 mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-full shadow-lg flex items-center gap-1 z-30 mb-2">
            {[
              {
                name: "Draw",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                ),
              },
              {
                name: "Sticky",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                name: "Flow",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V18a2 2 0 01-2 2H5.75A2.75 2.75 0 013 17.25V12a1 1 0 011-1h1.5a1 1 0 011 1zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                name: "Import",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                ),
              },
            ].map((tool) => (
              <button
                key={tool.name}
                className="flex items-center gap-1.5 px-4 py-2 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-55 dark:hover:bg-zinc-800 rounded-full text-xs font-bold transition-all hover:scale-[1.03] cursor-pointer"
                title={tool.name}
              >
                {tool.icon}
                <span>{tool.name}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Board Creation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new board</DialogTitle>
              <DialogDescription>
                Start with a blank canvas or use a template to jump ahead.
              </DialogDescription>
            </DialogHeader>

            {/* Dialog Body */}
            <div className="px-8 pb-6 flex flex-col gap-6">
              {/* Board Name Input Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-650 dark:text-zinc-400">
                  Board Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Untitled Board"
                  className="w-full bg-transparent border-b-2 border-indigo-600 dark:border-indigo-500 py-2 outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-450 dark:placeholder-zinc-600 transition-all font-medium text-xl"
                  autoFocus
                />
              </div>

              {/* Templates Section */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-zinc-650 dark:text-zinc-400">
                  Templates
                </label>
                
                {/* Template Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    {
                      id: "blank",
                      name: "Blank Canvas",
                      icon: (
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
                        </svg>
                      ),
                    },
                    {
                      id: "flowchart",
                      name: "Flowchart",
                      icon: (
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="3" y="14" width="6" height="6" rx="1" />
                          <rect x="15" y="14" width="6" height="6" rx="1" />
                          <rect x="9" y="4" width="6" height="6" rx="1" />
                          <path d="M12 10v2M6 12h12v2" strokeWidth={2} />
                        </svg>
                      ),
                    },
                    {
                      id: "wireframe",
                      name: "Wireframe",
                      icon: (
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M9 3v18M3 9h18" strokeWidth={2} />
                        </svg>
                      ),
                    },
                    {
                      id: "mindmap",
                      name: "Mind Map",
                      icon: (
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <circle cx="12" cy="12" r="3" />
                          <circle cx="5" cy="5" r="2" />
                          <circle cx="19" cy="5" r="2" />
                          <circle cx="5" cy="19" r="2" />
                          <circle cx="19" cy="19" r="2" />
                          <path d="M9.5 9.5l-3-3M14.5 9.5l3-3M9.5 14.5l-3 3M14.5 14.5l3 3" />
                        </svg>
                      ),
                    },
                  ].map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.id
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`flex flex-col items-center justify-between p-3.5 h-32 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/5 dark:border-indigo-500 dark:bg-indigo-950/10 ring-2 ring-indigo-600/30"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        {/* Icon Container */}
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-950/40 transition-all">
                          {tmpl.icon}
                        </div>
                        {/* Name */}
                        <span className="text-[11px] font-bold text-center tracking-tight text-zinc-700 dark:text-zinc-300 leading-tight">
                          {tmpl.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <DialogFooter>
              <button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNewBoardName("")
                  setSelectedTemplate("blank")
                }}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBoard}
                disabled={isSubmitting || !newBoardName.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Board"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Board Dialog */}
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Board</DialogTitle>
              <DialogDescription>
                Enter a new name for your board.
              </DialogDescription>
            </DialogHeader>

            <div className="px-8 pb-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-650 dark:text-zinc-400">
                  Board Name
                </label>
                <input
                  type="text"
                  value={renameBoardName}
                  onChange={(e) => setRenameBoardName(e.target.value)}
                  placeholder="Untitled Board"
                  className="w-full bg-transparent border-b-2 border-indigo-600 dark:border-indigo-500 py-2 outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-450 dark:placeholder-zinc-600 transition-all font-medium text-xl"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && renameBoardName.trim()) {
                      handleRenameBoard()
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => {
                  setIsRenameOpen(false)
                  setRenameBoardId("")
                  setRenameBoardName("")
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameBoard}
                disabled={!renameBoardName.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50"
              >
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Board Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-650 dark:text-red-400">Delete Board</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-zinc-50">"{deleteBoardName}"</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false)
                  setDeleteBoardId("")
                  setDeleteBoardName("")
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBoard}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-650 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-red-600/10"
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>

    </div>
  )
}
