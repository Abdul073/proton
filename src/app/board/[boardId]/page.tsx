"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { getBoardByIdAction, saveBoardDataAction, uploadBoardImageAction } from "@/app/actions/board"
import { useUser } from "@clerk/nextjs"
import { useBoardStore, Shape } from "@/lib/useBoardStore"
import { useTheme } from "next-themes"
import rough from "roughjs"

interface PageProps {
  params: Promise<{ boardId: string }>
}

interface TextInputState {
  x: number
  y: number
  clientX: number
  clientY: number
  value: string
}

interface StickyNoteInputState {
  id: string
  x: number
  y: number
  clientX: number
  clientY: number
  width: number
  height: number
  value: string
}

interface FrameInputState {
  id: string
  clientX: number
  clientY: number
  value: string
}

interface TableCellEditState {
  shapeId: string
  row: number
  col: number
  clientX: number
  clientY: number
  width: number
  height: number
  value: string
}

const HANDLE_RADIUS = 5

export default function BoardPage({ params }: PageProps) {
  const { boardId } = use(params)
  const { user, isLoaded } = useUser()
  const { theme } = useTheme()
  const [boardTitle, setBoardTitle] = React.useState("Loading Board...")
  
  // resolved theme fallback to handle system preferences
  const [resolvedTheme, setResolvedTheme] = React.useState("light")
  React.useEffect(() => {
    if (theme === "system") {
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")
      setResolvedTheme(darkQuery.matches ? "dark" : "light")
    } else {
      setResolvedTheme(theme || "light")
    }
  }, [theme])

  // Zustand shapes store
  const shapes = useBoardStore((state) => state.shapes)
  const selectedShapeId = useBoardStore((state) => state.selectedShapeId)
  const selectedShapeIds = useBoardStore((state) => state.selectedShapeIds)
  const setSelectedShapeId = useBoardStore((state) => state.setSelectedShapeId)
  const setSelectedShapeIds = useBoardStore((state) => state.setSelectedShapeIds)
  const addShape = useBoardStore((state) => state.addShape)
  const updateShape = useBoardStore((state) => state.updateShape)
  const updateShapeTransient = useBoardStore((state) => state.updateShapeTransient)
  const deleteSelectedShape = useBoardStore((state) => state.deleteSelectedShape)
  const clearShapes = useBoardStore((state) => state.clearShapes)
  const commitToHistory = useBoardStore((state) => state.commitToHistory)
  const undo = useBoardStore((state) => state.undo)
  const redo = useBoardStore((state) => state.redo)
  
  const selectedShape = shapes.find((s) => s.id === selectedShapeId)
  
  // Toolbar states
  const [activeTool, setActiveTool] = React.useState<
    "select" | "rectangle" | "circle" | "arrow" | "line" | "pencil" | "text" | "eraser" | "sticky-note" | "frame"
  >("select")
  const [strokeColor, setStrokeColor] = React.useState("#4f46e5")
  const [fillColor, setFillColor] = React.useState("transparent")
  const [strokeWidth, setStrokeWidth] = React.useState(3)
  const [zoom, setZoom] = React.useState(100)
  
  // New States and Refs
  const [isInsertOpen, setIsInsertOpen] = React.useState(false)
  const [editingStickyNoteInput, setEditingStickyNoteInput] = React.useState<StickyNoteInputState | null>(null)
  const [editingFrameInput, setEditingFrameInput] = React.useState<FrameInputState | null>(null)
  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
    clientX: number
    clientY: number
    shapeId: string
    row?: number
    col?: number
    type: "frame" | "table"
  } | null>(null)
  
  const [editingTableCell, setEditingTableCell] = React.useState<TableCellEditState | null>(null)
  const [tablePrompt, setTablePrompt] = React.useState<{ rows: number; cols: number } | null>(null)
  
  const insertMenuRef = React.useRef<HTMLDivElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const imageCache = React.useRef<Map<string, HTMLImageElement>>(new Map())

  // Sync status
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "error">("saved")
  const hasLoadedRef = React.useRef(false)

  // Ref for the HTML5 Canvas
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Interactive interaction states
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isResizing, setIsResizing] = React.useState(false)
  const [activeHandle, setActiveHandle] = React.useState<string | null>(null)
  
  const [startPos, setStartPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [pencilPoints, setPencilPoints] = React.useState<{ x: number; y: number }[]>([])
  const [previewElement, setPreviewElement] = React.useState<{
    type: string
    x: number
    y: number
    width: number
    height: number
    points?: { x: number; y: number }[]
  } | null>(null)

  // Overlay text area editor
  const [textInput, setTextInput] = React.useState<TextInputState | null>(null)

  // Fetch Board Details & shapes on mount
  React.useEffect(() => {
    getBoardByIdAction(boardId).then((b) => {
      if (b) {
        setBoardTitle(b.title)
        if (b.data && Array.isArray(b.data)) {
          // Restore shapes into Zustand store
          useBoardStore.getState().setShapes(b.data)
        } else {
          // Fallback to empty if brand new
          useBoardStore.getState().setShapes([])
        }
      } else {
        setBoardTitle("Board Not Found")
      }
      // Finished loading: allow autosave to trigger on subsequent changes
      hasLoadedRef.current = true
    })
  }, [boardId])

  // Debounced Autosave Sync Loop
  React.useEffect(() => {
    if (!hasLoadedRef.current) return

    setSaveStatus("saving")
    const timer = setTimeout(async () => {
      try {
        const res = await saveBoardDataAction(boardId, shapes)
        if (res.success) {
          setSaveStatus("saved")
        } else {
          setSaveStatus("error")
        }
      } catch (err) {
        console.error("Autosave failed", err)
        setSaveStatus("error")
      }
    }, 1500) // 1.5s debounce

    return () => clearTimeout(timer)
  }, [shapes, boardId])

  // Close Insert dropdown when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (insertMenuRef.current && !insertMenuRef.current.contains(e.target as Node)) {
        setIsInsertOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // Paste clipboard image support (Ctrl+V)
  React.useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            await uploadAndPlaceImage(file)
          }
        }
      }
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [boardId, zoom, addShape])

  // Helper to upload file and place on canvas center
  const uploadAndPlaceImage = async (file: File) => {
    setSaveStatus("saving")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadBoardImageAction(boardId, formData)
      
      if (result && result.success && result.url) {
        // Read file dimensions to place proportionally
        const img = new Image()
        img.src = result.url
        img.onload = () => {
          let width = img.width
          let height = img.height
          
          const maxDim = 400
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height * maxDim) / width
              width = maxDim
            } else {
              width = (width * maxDim) / height
              height = maxDim
            }
          }
          
          const canvas = canvasRef.current
          const viewWidth = canvas ? canvas.width : window.innerWidth
          const viewHeight = canvas ? canvas.height : window.innerHeight
          
          const centerX = (viewWidth / 2) / (zoom / 100)
          const centerY = (viewHeight / 2) / (zoom / 100)
          
          addShape({
            type: "image",
            x: centerX - width / 2,
            y: centerY - height / 2,
            width,
            height,
            stroke: "transparent",
            fill: "transparent",
            url: result.url,
          })
          setSaveStatus("saved")
        }
      } else {
        setSaveStatus("error")
      }
    } catch (err) {
      console.error("Failed to upload image", err)
      setSaveStatus("error")
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadAndPlaceImage(file)
    }
    e.target.value = ""
  }

  const handleInsertOptionClick = (id: string) => {
    console.log("Selected option:", id)
    setIsInsertOpen(false)
    if (id === "sticky-note") {
      setActiveTool("sticky-note")
      setSelectedShapeId(null)
    } else if (id === "image") {
      imageInputRef.current?.click()
    } else if (id === "frame") {
      setActiveTool("frame")
      setSelectedShapeId(null)
    } else if (id === "table") {
      setTablePrompt({ rows: 3, cols: 3 })
      setSelectedShapeId(null)
    }
  }

  const handleCreateTableSubmit = (rows: number, cols: number) => {
    setTablePrompt(null)
    const cellW = 100
    const cellH = 40
    const totalW = cols * cellW
    const totalH = rows * cellH
    
    const canvas = canvasRef.current
    const viewWidth = canvas ? canvas.width : window.innerWidth
    const viewHeight = canvas ? canvas.height : window.innerHeight
    
    const centerX = (viewWidth / 2) / (zoom / 100)
    const centerY = (viewHeight / 2) / (zoom / 100)
    
    const cellsGrid: string[][] = []
    for (let r = 0; r < rows; r++) {
      cellsGrid.push(Array(cols).fill(""))
    }
    
    const colWidths = Array(cols).fill(cellW)
    const rowHeights = Array(rows).fill(cellH)
    
    addShape({
      type: "table",
      x: centerX - totalW / 2,
      y: centerY - totalH / 2,
      width: totalW,
      height: totalH,
      stroke: strokeColor || "#4f46e5",
      fill: "transparent",
      rows,
      cols,
      cells: cellsGrid,
      colWidths,
      rowHeights,
    })
  }

  const handleTableAction = (
    action: "insert-row-above" | "insert-row-below" | "insert-col-left" | "insert-col-right" | "delete-row" | "delete-col",
    shapeId: string,
    row: number,
    col: number
  ) => {
    const table = shapes.find((s) => s.id === shapeId)
    if (!table || table.type !== "table") return
    
    let { rows = 0, cols = 0, cells = [], colWidths = [], rowHeights = [], width, height } = table
    
    let newCells = cells.map(r => [...r])
    let newColWidths = [...colWidths]
    let newRowHeights = [...rowHeights]
    let newRows = rows
    let newCols = cols
    let newW = width
    let newH = height
    
    const DEFAULT_ROW_H = 40
    const DEFAULT_COL_W = 100
    
    if (action === "insert-row-above") {
      newCells.splice(row, 0, Array(cols).fill(""))
      newRowHeights.splice(row, 0, DEFAULT_ROW_H)
      newRows += 1
      newH += DEFAULT_ROW_H
    } else if (action === "insert-row-below") {
      newCells.splice(row + 1, 0, Array(cols).fill(""))
      newRowHeights.splice(row + 1, 0, DEFAULT_ROW_H)
      newRows += 1
      newH += DEFAULT_ROW_H
    } else if (action === "insert-col-left") {
      newCells = newCells.map(r => {
        const copy = [...r]
        copy.splice(col, 0, "")
        return copy
      })
      newColWidths.splice(col, 0, DEFAULT_COL_W)
      newCols += 1
      newW += DEFAULT_COL_W
    } else if (action === "insert-col-right") {
      newCells = newCells.map(r => {
        const copy = [...r]
        copy.splice(col + 1, 0, "")
        return copy
      })
      newColWidths.splice(col + 1, 0, DEFAULT_COL_W)
      newCols += 1
      newW += DEFAULT_COL_W
    } else if (action === "delete-row") {
      if (rows <= 1) return
      const removedH = newRowHeights[row]
      newCells.splice(row, 1)
      newRowHeights.splice(row, 1)
      newRows -= 1
      newH -= removedH
    } else if (action === "delete-col") {
      if (cols <= 1) return
      const removedW = newColWidths[col]
      newCells = newCells.map(r => {
        const copy = [...r]
        copy.splice(col, 1)
        return copy
      })
      newColWidths.splice(col, 1)
      newCols -= 1
      newW -= removedW
    }
    
    updateShape(shapeId, {
      rows: newRows,
      cols: newCols,
      cells: newCells,
      colWidths: newColWidths,
      rowHeights: newRowHeights,
      width: newW,
      height: newH,
    })
    
    commitToHistory(
      useBoardStore.getState().shapes.map((s) =>
        s.id === shapeId
          ? {
              ...s,
              rows: newRows,
              cols: newCols,
              cells: newCells,
              colWidths: newColWidths,
              rowHeights: newRowHeights,
              width: newW,
              height: newH,
            }
          : s
      )
    )
  }

  // Close context menu on click anywhere
  React.useEffect(() => {
    const closeMenu = () => setContextMenu(null)
    window.addEventListener("click", closeMenu)
    return () => window.removeEventListener("click", closeMenu)
  }, [])

  const getClientCoordinates = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: rect.left + x * (zoom / 100),
      y: rect.top + y * (zoom / 100),
    }
  }

  const getClientSize = (w: number, h: number) => {
    return {
      width: w * (zoom / 100),
      height: h * (zoom / 100),
    }
  }

  // Get mouse coordinates relative to canvas, accounting for zoom scaling
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)
    return { x, y }
  }

  // Get bounding box coordinates for a shape
  const getShapeBoundingBox = (shape: Shape) => {
    if (shape.type === "pencil" && shape.points && shape.points.length > 0) {
      const xs = shape.points.map((p) => p.x)
      const ys = shape.points.map((p) => p.y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      }
    }
    
    const x = Math.min(shape.x, shape.x + shape.width)
    const y = Math.min(shape.y, shape.y + shape.height)
    const width = Math.abs(shape.width)
    const height = Math.abs(shape.height)
    return { x, y, width, height }
  }

  // Bounding box selection handles (8 positions)
  const getHandles = (bbox: { x: number; y: number; width: number; height: number }) => {
    const { x, y, width: w, height: h } = bbox
    return [
      { x, y, name: "tl" },
      { x: x + w / 2, y, name: "tc" },
      { x: x + w, y, name: "tr" },
      { x, y: y + h / 2, name: "ml" },
      { x: x + w, y: y + h / 2, name: "mr" },
      { x, y: y + h, name: "bl" },
      { x: x + w / 2, y: y + h, name: "bc" },
      { x: x + w, y: y + h, name: "br" },
    ]
  }

  // Distance from point to line segment
  const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
    if (l2 === 0) return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2))
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2
    t = Math.max(0, Math.min(1, t))
    const projX = x1 + t * (x2 - x1)
    const projY = y1 + t * (y2 - y1)
    return Math.sqrt(Math.pow(px - projX, 2) + Math.pow(py - projY, 2))
  }

  // Hit-testing check: is cursor clicking a shape?
  const isPointInsideShape = (px: number, py: number, shape: Shape) => {
    const bbox = getShapeBoundingBox(shape)
    
    if (
      shape.type === "rectangle" ||
      shape.type === "ellipse" ||
      shape.type === "text" ||
      shape.type === "sticky-note" ||
      shape.type === "image" ||
      shape.type === "frame" ||
      shape.type === "table"
    ) {
      return (
        px >= bbox.x &&
        px <= bbox.x + bbox.width &&
        py >= bbox.y &&
        py <= bbox.y + bbox.height
      )
    }
    
    if (shape.type === "line" || shape.type === "arrow") {
      const x1 = shape.x
      const y1 = shape.y
      const x2 = shape.x + shape.width
      const y2 = shape.y + shape.height
      return distanceToLineSegment(px, py, x1, y1, x2, y2) < 12 // 12px padding target
    }
    
    if (shape.type === "pencil" && shape.points) {
      return shape.points.some(
        (p) => Math.sqrt(Math.pow(px - p.x, 2) + Math.pow(py - p.y, 2)) < 12
      )
    }
    
    return false
  }

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (textInput) return // Let text box handle its blur

    const coord = getCoordinates(e)
    const px = coord.x
    const py = coord.y

    if (activeTool === "select") {
      // 1. Check if clicked a handle of the selected shape
      if (selectedShapeId) {
        const selectedShape = shapes.find((s) => s.id === selectedShapeId)
        if (selectedShape) {
          const bbox = getShapeBoundingBox(selectedShape)
          const handles = selectedShape.type === "line" || selectedShape.type === "arrow"
            ? [
                { x: selectedShape.x, y: selectedShape.y, name: "start" },
                { x: selectedShape.x + selectedShape.width, y: selectedShape.y + selectedShape.height, name: "end" }
              ]
            : getHandles(bbox)
            
          const clickedHandle = handles.find(
            (h) => Math.sqrt(Math.pow(px - h.x, 2) + Math.pow(py - h.y, 2)) < 10
          )
          
          if (clickedHandle) {
            setIsResizing(true)
            setActiveHandle(clickedHandle.name)
            setStartPos(coord)
            return
          }
        }
      }

      // 2. Check if clicked inside a shape
      const clickedShape = [...shapes].reverse().find((s) => isPointInsideShape(px, py, s))
      if (clickedShape) {
        if (!selectedShapeIds.includes(clickedShape.id)) {
          setSelectedShapeIds([clickedShape.id])
        }
        setIsDragging(true)
        setStartPos(coord)
        setDragOffset({
          x: px - clickedShape.x,
          y: py - clickedShape.y,
        })
      } else {
        setSelectedShapeIds([])
      }
    } else if (activeTool === "text") {
      const canvas = canvasRef.current
      if (canvas) {
        setTextInput({
          x: px,
          y: py,
          clientX: e.clientX,
          clientY: e.clientY,
          value: "",
        })
      }
    } else if (activeTool === "sticky-note") {
      addShape({
        type: "sticky-note",
        x: px - 100,
        y: py - 100,
        width: 200,
        height: 200,
        stroke: "transparent",
        fill: "transparent",
        color: "#FEF3C7",
        text: "",
      })
      setActiveTool("select")
    } else if (activeTool === "eraser") {
      const clickedShape = [...shapes].reverse().find((s) => isPointInsideShape(px, py, s))
      if (clickedShape) {
        setSelectedShapeId(clickedShape.id)
        deleteSelectedShape()
      }
    } else {
      // Drawing shapes (Rectangle, Circle, Arrow, Line, Pencil)
      setIsDrawing(true)
      setStartPos(coord)
      if (activeTool === "pencil") {
        setPencilPoints([coord])
        setPreviewElement({
          type: "pencil",
          x: coord.x,
          y: coord.y,
          width: 0,
          height: 0,
          points: [coord],
        })
      } else {
        setPreviewElement({
          type: activeTool,
          x: coord.x,
          y: coord.y,
          width: 0,
          height: 0,
        })
      }
    }
  }

  const updateShapeResize = (id: string, shape: Shape, updates: Partial<Shape>) => {
    let finalUpdates = { ...updates }
    
    if (shape.type === "table") {
      let newWidth = updates.width !== undefined ? updates.width : shape.width
      let newHeight = updates.height !== undefined ? updates.height : shape.height
      
      if (newWidth < 30) newWidth = 30
      if (newHeight < 30) newHeight = 30
      
      const scaleX = newWidth / (shape.width || 1)
      const scaleY = newHeight / (shape.height || 1)
      
      const colWidths = (shape.colWidths || []).map(w => Math.max(5, w * scaleX))
      const rowHeights = (shape.rowHeights || []).map(h => Math.max(5, h * scaleY))
      
      finalUpdates = {
        ...finalUpdates,
        width: newWidth,
        height: newHeight,
        colWidths,
        rowHeights,
      }
    }
    
    updateShapeTransient(id, finalUpdates)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coord = getCoordinates(e)
    const px = coord.x
    const py = coord.y

    if (activeTool === "select" && selectedShapeId) {
      const selectedShape = shapes.find((s) => s.id === selectedShapeId)
      if (!selectedShape) return

      if (isDragging) {
        const diffX = px - startPos.x
        const diffY = py - startPos.y

        const shapesToMove = new Set<string>()
        selectedShapeIds.forEach((id) => shapesToMove.add(id))

        shapes.forEach((s) => {
          if (s.type === "frame" && shapesToMove.has(s.id)) {
            shapes.forEach((child) => {
              if (child.parentFrameId === s.id) {
                shapesToMove.add(child.id)
              }
            })
          }
        })

        shapesToMove.forEach((id) => {
          const s = shapes.find((x) => x.id === id)
          if (!s) return
          if (s.type === "pencil" && s.points) {
            const updatedPoints = s.points.map((pt) => ({
              x: pt.x + diffX,
              y: pt.y + diffY,
            }))
            updateShapeTransient(id, {
              x: s.x + diffX,
              y: s.y + diffY,
              points: updatedPoints,
            })
          } else {
            updateShapeTransient(id, {
              x: s.x + diffX,
              y: s.y + diffY,
            })
          }
        })
        setStartPos(coord)
      } else if (isResizing && activeHandle) {
        const { x, y, width, height } = selectedShape
        
        if (selectedShape.type === "line" || selectedShape.type === "arrow") {
          if (activeHandle === "start") {
            const x2 = x + width
            const y2 = y + height
            updateShapeTransient(selectedShapeId, {
              x: px,
              y: py,
              width: x2 - px,
              height: y2 - py,
            })
          } else if (activeHandle === "end") {
            updateShapeTransient(selectedShapeId, {
              width: px - x,
              height: py - y,
            })
          }
        } else {
          // 8 Bounding Box handles
          if (activeHandle === "br") {
            updateShapeResize(selectedShapeId, selectedShape, { width: px - x, height: py - y })
          } else if (activeHandle === "mr") {
            updateShapeResize(selectedShapeId, selectedShape, { width: px - x })
          } else if (activeHandle === "bc") {
            updateShapeResize(selectedShapeId, selectedShape, { height: py - y })
          } else if (activeHandle === "tl") {
            updateShapeResize(selectedShapeId, selectedShape, {
              x: px,
              y: py,
              width: (x + width) - px,
              height: (y + height) - py,
            })
          } else if (activeHandle === "ml") {
            updateShapeResize(selectedShapeId, selectedShape, {
              x: px,
              width: (x + width) - px,
            })
          } else if (activeHandle === "tc") {
            updateShapeResize(selectedShapeId, selectedShape, {
              y: py,
              height: (y + height) - py,
            })
          } else if (activeHandle === "tr") {
            updateShapeResize(selectedShapeId, selectedShape, {
              y: py,
              width: px - x,
              height: (y + height) - py,
            })
          } else if (activeHandle === "bl") {
            updateShapeResize(selectedShapeId, selectedShape, {
              x: px,
              width: (x + width) - px,
              height: py - y,
            })
          }
        }
      }
    } else if (isDrawing && previewElement) {
      const dx = px - startPos.x
      const dy = py - startPos.y
      
      if (activeTool === "pencil") {
        const nextPoints = [...pencilPoints, coord]
        setPencilPoints(nextPoints)
        setPreviewElement({
          ...previewElement,
          points: nextPoints,
        })
      } else {
        setPreviewElement({
          ...previewElement,
          width: dx,
          height: dy,
        })
      }
    }
  }

  const handleMouseUp = () => {
    // Commit selection drag/resize changes to undo history on mouse release
    if (isDragging || isResizing) {
      setIsDragging(false)
      setIsResizing(false)
      setActiveHandle(null)
      commitToHistory(shapes)
      return
    }

    if (isDrawing && previewElement) {
      setIsDrawing(false)
      let { type, x, y, width, height, points } = previewElement
      
      // Normalize negative dimensions
      if (type === "rectangle" || type === "circle" || type === "frame") {
        if (width < 0) {
          x = x + width
          width = Math.abs(width)
        }
        if (height < 0) {
          y = y + height
          height = Math.abs(height)
        }
      }

      if (type === "pencil" && points && points.length > 1) {
        addShape({
          type: "pencil",
          x,
          y,
          width,
          height,
          points,
          stroke: strokeColor,
          fill: "transparent",
        })
      } else if (type === "rectangle" && Math.abs(width) > 5 && Math.abs(height) > 5) {
        addShape({
          type: "rectangle",
          x,
          y,
          width,
          height,
          stroke: strokeColor,
          fill: fillColor,
          strokeWidth,
        })
      } else if (type === "circle" && Math.abs(width) > 5 && Math.abs(height) > 5) {
        addShape({
          type: "ellipse",
          x,
          y,
          width,
          height,
          stroke: strokeColor,
          fill: fillColor,
          strokeWidth,
        })
      } else if (type === "line" && (Math.abs(width) > 5 || Math.abs(height) > 5)) {
        addShape({
          type: "line",
          x,
          y,
          width,
          height,
          stroke: strokeColor,
          fill: "transparent",
          strokeWidth,
        })
      } else if (type === "arrow" && (Math.abs(width) > 5 || Math.abs(height) > 5)) {
        addShape({
          type: "arrow",
          x,
          y,
          width,
          height,
          stroke: strokeColor,
          fill: "transparent",
          strokeWidth,
        })
      } else if (type === "frame" && Math.abs(width) > 10 && Math.abs(height) > 10) {
        const frameCount = shapes.filter((s) => s.type === "frame").length
        addShape({
          type: "frame",
          x,
          y,
          width,
          height,
          stroke: "transparent",
          fill: "transparent",
          name: `Frame ${frameCount + 1}`,
        })
        setActiveTool("select")
      }
      
      setPreviewElement(null)
      setPencilPoints([])
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coord = getCoordinates(e)
    const px = coord.x
    const py = coord.y
    
    // Find if clicked inside a shape
    const clickedShape = [...shapes].reverse().find((s) => isPointInsideShape(px, py, s))
    if (clickedShape && clickedShape.type === "sticky-note") {
      const clientPos = getClientCoordinates(clickedShape.x, clickedShape.y)
      const clientSize = getClientSize(clickedShape.width, clickedShape.height)
      
      setEditingStickyNoteInput({
        id: clickedShape.id,
        x: clickedShape.x,
        y: clickedShape.y,
        clientX: clientPos.x,
        clientY: clientPos.y,
        width: clientSize.width,
        height: clientSize.height,
        value: clickedShape.text || "",
      })
    } else if (clickedShape && clickedShape.type === "frame") {
      const tabClientPos = getClientCoordinates(clickedShape.x, clickedShape.y - 18)
      setEditingFrameInput({
        id: clickedShape.id,
        clientX: tabClientPos.x,
        clientY: tabClientPos.y,
        value: clickedShape.name || "",
      })
    } else if (clickedShape && clickedShape.type === "table") {
      const { x, y, colWidths = [], rowHeights = [] } = clickedShape
      let currentY = y
      let targetRow = -1
      for (let r = 0; r < rowHeights.length; r++) {
        if (py >= currentY && py <= currentY + rowHeights[r]) {
          targetRow = r
          break
        }
        currentY += rowHeights[r]
      }
      
      let currentX = x
      let targetCol = -1
      for (let c = 0; c < colWidths.length; c++) {
        if (px >= currentX && px <= currentX + colWidths[c]) {
          targetCol = c
          break
        }
        currentX += colWidths[c]
      }
      
      if (targetRow !== -1 && targetCol !== -1) {
        let cellX = x
        for (let c = 0; c < targetCol; c++) cellX += colWidths[c]
        let cellY = y
        for (let r = 0; r < targetRow; r++) cellY += rowHeights[r]
        
        const cellW = colWidths[targetCol]
        const cellH = rowHeights[targetRow]
        
        const clientPos = getClientCoordinates(cellX, cellY)
        const clientSize = getClientSize(cellW, cellH)
        
        setEditingTableCell({
          shapeId: clickedShape.id,
          row: targetRow,
          col: targetCol,
          clientX: clientPos.x,
          clientY: clientPos.y,
          width: clientSize.width,
          height: clientSize.height,
          value: clickedShape.cells?.[targetRow]?.[targetCol] || "",
        })
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const coord = getCoordinates(e)
    const px = coord.x
    const py = coord.y
    
    const clickedShape = [...shapes].reverse().find((s) => isPointInsideShape(px, py, s))
    if (clickedShape) {
      if (clickedShape.type === "frame") {
        setContextMenu({
          x: px,
          y: py,
          clientX: e.clientX,
          clientY: e.clientY,
          shapeId: clickedShape.id,
          type: "frame",
        })
      } else if (clickedShape.type === "table") {
        const { x, y, colWidths = [], rowHeights = [] } = clickedShape
        let currentY = y
        let targetRow = -1
        for (let r = 0; r < rowHeights.length; r++) {
          if (py >= currentY && py <= currentY + rowHeights[r]) {
            targetRow = r
            break
          }
          currentY += rowHeights[r]
        }
        
        let currentX = x
        let targetCol = -1
        for (let c = 0; c < colWidths.length; c++) {
          if (px >= currentX && px <= currentX + colWidths[c]) {
            targetCol = c
            break
          }
          currentX += colWidths[c]
        }
        
        if (targetRow !== -1 && targetCol !== -1) {
          setContextMenu({
            x: px,
            y: py,
            clientX: e.clientX,
            clientY: e.clientY,
            shapeId: clickedShape.id,
            row: targetRow,
            col: targetCol,
            type: "table",
          })
        }
      }
    } else {
      setContextMenu(null)
    }
  }

  // Keyboard listeners: hotkeys for Delete, Undo/Redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteSelectedShape()
      }
      
      if (e.key === "z" && e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      if ((e.key === "z" && e.ctrlKey && e.shiftKey) || (e.key === "y" && e.ctrlKey)) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [deleteSelectedShape, undo, redo])

  // Canvas draw functions
  const drawArrow = (rc: any, x1: number, y1: number, x2: number, y2: number, options: any) => {
    rc.line(x1, y1, x2, y2, options)
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const arrowLength = 14
    const xArrow1 = x2 - arrowLength * Math.cos(angle - Math.PI / 6)
    const yArrow1 = y2 - arrowLength * Math.sin(angle - Math.PI / 6)
    const xArrow2 = x2 - arrowLength * Math.cos(angle + Math.PI / 6)
    const yArrow2 = y2 - arrowLength * Math.sin(angle + Math.PI / 6)
    
    rc.line(x2, y2, xArrow1, yArrow1, options)
    rc.line(x2, y2, xArrow2, yArrow2, options)
  }

  // Core Canvas rendering routine
  const renderCanvas = React.useCallback((isExporting: boolean = false) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 1. Theme background color drawing
    const isDark = resolvedTheme === "dark"
    ctx.fillStyle = isDark ? "#09090b" : "#fcfcfd"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    
    // Zoom scaling
    ctx.scale(zoom / 100, zoom / 100)

    // 2. Draw Dotted grid on canvas (zooms smoothly, exports into PNG)
    ctx.fillStyle = isDark ? "rgba(63, 63, 70, 0.4)" : "rgba(228, 228, 230, 0.8)"
    const gridLimit = 10000
    const dotSpacing = 20
    const dotRadius = 1
    for (let x = 0; x < gridLimit; x += dotSpacing) {
      for (let y = 0; y < gridLimit; y += dotSpacing) {
        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    const rc = rough.canvas(canvas)

    // 3. Draw Saved Shapes
    const drawShape = (shape: Shape) => {
      const options: any = {
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth || 2,
      }

      if (shape.fill && shape.fill !== "transparent") {
        options.fill = shape.fill
        options.fillStyle = "solid"
      }

      if (shape.type === "rectangle") {
        rc.rectangle(shape.x, shape.y, shape.width, shape.height, options)
      } else if (shape.type === "ellipse") {
        const cx = shape.x + shape.width / 2
        const cy = shape.y + shape.height / 2
        rc.ellipse(cx, cy, shape.width, shape.height, options)
      } else if (shape.type === "line") {
        rc.line(shape.x, shape.y, shape.x + shape.width, shape.y + shape.height, options)
      } else if (shape.type === "arrow") {
        drawArrow(rc, shape.x, shape.y, shape.x + shape.width, shape.y + shape.height, options)
      } else if (shape.type === "pencil" && shape.points) {
        const pts = shape.points.map((p) => [p.x, p.y] as [number, number])
        rc.linearPath(pts, options)
      } else if (shape.type === "text" && shape.text) {
        ctx.fillStyle = shape.stroke
        ctx.font = "bold 16px sans-serif"
        ctx.textBaseline = "top"
        const lines = shape.text.split("\n")
        lines.forEach((l, i) => {
          ctx.fillText(l, shape.x, shape.y + i * 20)
        })
      } else if (shape.type === "sticky-note") {
        ctx.save()
        ctx.fillStyle = shape.color || "#FEF3C7"
        
        ctx.shadowColor = "rgba(0, 0, 0, 0.08)"
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 4
        
        ctx.beginPath()
        ctx.roundRect(shape.x, shape.y, shape.width, shape.height, 12)
        ctx.fill()
        
        ctx.shadowColor = "transparent"
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)"
        ctx.lineWidth = 1
        ctx.stroke()
        
        if (shape.text) {
          ctx.fillStyle = "#1f2937"
          ctx.font = "medium 14px sans-serif"
          ctx.textBaseline = "top"
          
          const padding = 16
          const maxWidth = shape.width - padding * 2
          const maxHeight = shape.height - padding * 2
          const words = shape.text.split(" ")
          let line = ""
          const lines: string[] = []
          
          for (let n = 0; n < words.length; n++) {
            const subWords = words[n].split("\n")
            for (let k = 0; k < subWords.length; k++) {
              const testLine = line + subWords[k] + " "
              const metrics = ctx.measureText(testLine)
              if (metrics.width > maxWidth && line !== "") {
                lines.push(line.trim())
                line = subWords[k] + " "
              } else {
                line = testLine
              }
              if (k < subWords.length - 1) {
                lines.push(line.trim())
                line = ""
              }
            }
          }
          lines.push(line.trim())
          
          const lineHeight = 20
          for (let i = 0; i < lines.length; i++) {
            if ((i + 1) * lineHeight > maxHeight) break
            ctx.fillText(lines[i], shape.x + padding, shape.y + padding + i * lineHeight)
          }
        }
        ctx.restore()
      } else if (shape.type === "image" && shape.url) {
        const img = imageCache.current.get(shape.url)
        if (img) {
          if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height)
          } else {
            ctx.fillStyle = isDark ? "#27272a" : "#f4f4f5"
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
          }
        } else {
          const newImg = new Image()
          newImg.src = shape.url
          newImg.onload = () => {
            renderCanvas()
          }
          imageCache.current.set(shape.url, newImg)
          ctx.fillStyle = isDark ? "#27272a" : "#f4f4f5"
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
        }
      } else if (shape.type === "frame") {
        const isFrameSelected = selectedShapeIds.includes(shape.id)
        const borderCol = isFrameSelected ? "#4f46e5" : (isDark ? "#3f3f46" : "#d4d4d8")
        
        ctx.save()
        ctx.strokeStyle = borderCol
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        ctx.setLineDash([])
        
        const labelText = shape.name || "Frame"
        ctx.font = "bold 11px sans-serif"
        const textWidth = ctx.measureText(labelText).width
        const tabWidth = textWidth + 16
        const tabHeight = 18
        const tabX = shape.x
        const tabY = shape.y - tabHeight
        
        ctx.fillStyle = borderCol
        ctx.beginPath()
        ctx.roundRect(tabX, tabY, tabWidth, tabHeight, [4, 4, 0, 0])
        ctx.fill()
        
        ctx.fillStyle = isFrameSelected ? "#ffffff" : (isDark ? "#d4d4d8" : "#27272a")
        ctx.textBaseline = "middle"
        ctx.fillText(labelText, tabX + 8, tabY + tabHeight / 2)
        ctx.restore()
      } else if (shape.type === "table") {
        const { rows = 0, cols = 0, cells = [], colWidths = [], rowHeights = [] } = shape
        ctx.save()
        ctx.strokeStyle = shape.stroke || strokeColor || "#4f46e5"
        ctx.lineWidth = shape.strokeWidth || 2
        
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        
        const colX: number[] = [shape.x]
        for (let c = 0; c < colWidths.length; c++) {
          colX.push(colX[c] + colWidths[c])
        }
        const rowY: number[] = [shape.y]
        for (let r = 0; r < rowHeights.length; r++) {
          rowY.push(rowY[r] + rowHeights[r])
        }
        
        for (let c = 1; c < cols; c++) {
          ctx.beginPath()
          ctx.moveTo(colX[c], shape.y)
          ctx.lineTo(colX[c], shape.y + shape.height)
          ctx.stroke()
        }
        
        for (let r = 1; r < rows; r++) {
          ctx.beginPath()
          ctx.moveTo(shape.x, rowY[r])
          ctx.lineTo(shape.x + shape.width, rowY[r])
          ctx.stroke()
        }
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellText = cells[r]?.[c] || ""
            if (cellText) {
              const cX = colX[c]
              const cY = rowY[r]
              const cW = colWidths[c]
              const cH = rowHeights[r]
              
              ctx.save()
              ctx.beginPath()
              ctx.rect(cX + 4, cY + 4, cW - 8, cH - 8)
              ctx.clip()
              
              ctx.fillStyle = isDark ? "#f4f4f5" : "#18181b"
              ctx.font = "13px sans-serif"
              ctx.textBaseline = "middle"
              ctx.textAlign = "left"
              
              ctx.fillText(cellText, cX + 8, cY + cH / 2)
              ctx.restore()
            }
          }
        }
        ctx.restore()
      }
    }

    const frames = shapes.filter((s) => s.type === "frame")
    const nonFrames = shapes.filter((s) => s.type !== "frame")
    
    frames.forEach(drawShape)
    nonFrames.forEach(drawShape)

    // 4. Draw active preview shape during click-drag
    if (previewElement) {
      const options: any = {
        stroke: strokeColor,
        strokeWidth,
      }
      if (fillColor !== "transparent") {
        options.fill = fillColor
        options.fillStyle = "solid"
      }

      const { type, x, y, width, height, points } = previewElement
      
      if (type === "rectangle") {
        rc.rectangle(x, y, width, height, options)
      } else if (type === "circle") {
        const cx = x + width / 2
        const cy = y + height / 2
        rc.ellipse(cx, cy, width, height, options)
      } else if (type === "line") {
        rc.line(x, y, x + width, y + height, options)
      } else if (type === "arrow") {
        drawArrow(rc, x, y, x + width, y + height, options)
      } else if (type === "pencil" && points) {
        const pts = points.map((p) => [p.x, p.y] as [number, number])
        rc.linearPath(pts, options)
      } else if (type === "frame") {
        ctx.save()
        ctx.strokeStyle = "#4f46e5"
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.strokeRect(x, y, width, height)
        ctx.restore()
      }
    }

    // 5. Draw Selected Bounding Box & Handles (Clean solid lines, skipped on export)
    if (selectedShapeIds.length > 0 && !isExporting) {
      selectedShapeIds.forEach((id) => {
        const selectedShape = shapes.find((s) => s.id === id)
        if (selectedShape) {
          const bbox = getShapeBoundingBox(selectedShape)
          
          ctx.strokeStyle = "#4f46e5"
          ctx.lineWidth = 1.5
          ctx.setLineDash([6, 4])
          ctx.strokeRect(bbox.x - 4, bbox.y - 4, bbox.width + 8, bbox.height + 8)
          ctx.setLineDash([])

          if (selectedShapeIds.length === 1) {
            const handles = selectedShape.type === "line" || selectedShape.type === "arrow"
              ? [
                  { x: selectedShape.x, y: selectedShape.y, name: "start" },
                  { x: selectedShape.x + selectedShape.width, y: selectedShape.y + selectedShape.height, name: "end" }
                ]
              : getHandles(bbox)

            handles.forEach((h) => {
              ctx.beginPath()
              ctx.arc(h.x, h.y, HANDLE_RADIUS, 0, 2 * Math.PI)
              ctx.fillStyle = "#ffffff"
              ctx.fill()
              ctx.strokeStyle = "#4f46e5"
              ctx.lineWidth = 1.8
              ctx.stroke()
            })
          }
        }
      })
    }

    ctx.restore()
  }, [shapes, previewElement, selectedShapeIds, zoom, strokeColor, fillColor, strokeWidth, resolvedTheme])

  // Canvas Resize and Render Effect hook
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      renderCanvas()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [renderCanvas])

  // PNG Export Function (renders clean elements and triggers download)
  const handleExportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Draw clean frame without dashed handles
    renderCanvas(true)
    
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `${boardTitle.toLowerCase().replace(/\s+/g, "-") || "whiteboard"}.png`
    link.href = dataUrl
    link.click()
    
    // Restore editing selections
    renderCanvas(false)
  }

  return (
    <div className="relative w-screen h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950/50 select-none overflow-hidden">
      
      {/* Viewport Canvas context */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className="absolute inset-0 z-0 block outline-none"
        style={{
          cursor:
            activeTool === "sticky-note" || activeTool === "frame"
              ? "cell"
              : activeTool === "select"
              ? "default"
              : "crosshair",
        }}
      />

      {/* FRAME NAME EDITING OVERLAY */}
      {editingFrameInput && (
        <input
          autoFocus
          type="text"
          value={editingFrameInput.value}
          onChange={(e) => setEditingFrameInput({ ...editingFrameInput, value: e.target.value })}
          onBlur={() => {
            updateShape(editingFrameInput.id, { name: editingFrameInput.value || "Frame" })
            commitToHistory(
              useBoardStore.getState().shapes.map((s) =>
                s.id === editingFrameInput.id ? { ...s, name: editingFrameInput.value || "Frame" } : s
              )
            )
            setEditingFrameInput(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur()
            } else if (e.key === "Escape") {
              setEditingFrameInput(null)
            }
          }}
          className="absolute bg-indigo-600 text-white outline-none border-none rounded-t-md px-2.5 py-0.5 font-bold text-[11px] z-30 shadow-md"
          style={{
            left: editingFrameInput.clientX,
            top: editingFrameInput.clientY,
            height: "18px",
            lineHeight: "18px",
          }}
        />
      )}

      {/* FRAME & TABLE RIGHT-CLICK CONTEXT MENU */}
      {contextMenu && (
        <div
          className="absolute bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 min-w-[180px]"
          style={{
            left: contextMenu.clientX,
            top: contextMenu.clientY,
          }}
        >
          {contextMenu.type === "frame" && (
            <button
              onClick={() => {
                const children = shapes.filter((s) => s.parentFrameId === contextMenu.shapeId)
                const childIds = children.map((c) => c.id)
                if (childIds.length > 0) {
                  setSelectedShapeIds(childIds)
                } else {
                  setSelectedShapeIds([])
                }
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
              </svg>
              Select Frame Contents
            </button>
          )}

          {contextMenu.type === "table" && contextMenu.row !== undefined && contextMenu.col !== undefined && (
            <div className="flex flex-col">
              <button
                onClick={() => {
                  handleTableAction("insert-row-above", contextMenu.shapeId, contextMenu.row!, contextMenu.col!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2 cursor-pointer"
              >
                Insert Row Above
              </button>
              <button
                onClick={() => {
                  handleTableAction("insert-row-below", contextMenu.shapeId, contextMenu.row!, contextMenu.col!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2 cursor-pointer"
              >
                Insert Row Below
              </button>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
              <button
                onClick={() => {
                  handleTableAction("insert-col-left", contextMenu.shapeId, contextMenu.row!, contextMenu.col!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2 cursor-pointer"
              >
                Insert Column Left
              </button>
              <button
                onClick={() => {
                  handleTableAction("insert-col-right", contextMenu.shapeId, contextMenu.row!, contextMenu.col!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2 cursor-pointer"
              >
                Insert Column Right
              </button>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
              <button
                onClick={() => {
                  handleTableAction("delete-row", contextMenu.shapeId, contextMenu.row!, contextMenu.col!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 cursor-pointer"
              >
                Delete Row
              </button>
              <button
                onClick={() => {
                  handleTableAction("delete-col", contextMenu.shapeId, contextMenu.row!, contextMenu.col!)
                  setContextMenu(null)
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 cursor-pointer"
              >
                Delete Column
              </button>
            </div>
          )}
        </div>
      )}

      {/* TABLE CONFIGURATION POPOVER */}
      {tablePrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 w-72 flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100">
            <h3 className="font-bold text-sm text-center">Insert Table</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Rows</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTablePrompt({ ...tablePrompt, rows: Math.max(1, tablePrompt.rows - 1) })}
                  className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-bold text-xs"
                >
                  —
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tablePrompt.rows}
                  onChange={(e) => setTablePrompt({ ...tablePrompt, rows: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className="w-12 text-center text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setTablePrompt({ ...tablePrompt, rows: Math.min(20, tablePrompt.rows + 1) })}
                  className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Columns</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTablePrompt({ ...tablePrompt, cols: Math.max(1, tablePrompt.cols - 1) })}
                  className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-bold text-xs"
                >
                  —
                </button>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={tablePrompt.cols}
                  onChange={(e) => setTablePrompt({ ...tablePrompt, cols: Math.min(15, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className="w-12 text-center text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setTablePrompt({ ...tablePrompt, cols: Math.min(15, tablePrompt.cols + 1) })}
                  className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setTablePrompt(null)}
                className="flex-1 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors text-center border border-zinc-250 dark:border-zinc-750"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateTableSubmit(tablePrompt.rows, tablePrompt.cols)}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 transition-colors text-center"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE CELL TEXT EDITING OVERLAY */}
      {editingTableCell && (
        <textarea
          autoFocus
          value={editingTableCell.value}
          onChange={(e) => setEditingTableCell({ ...editingTableCell, value: e.target.value })}
          onBlur={() => {
            const tableShape = shapes.find((s) => s.id === editingTableCell.shapeId)
            if (tableShape && tableShape.cells) {
              const updatedCells = tableShape.cells.map((row) => [...row])
              updatedCells[editingTableCell.row][editingTableCell.col] = editingTableCell.value
              updateShape(editingTableCell.shapeId, { cells: updatedCells })
              commitToHistory(
                useBoardStore.getState().shapes.map((s) =>
                  s.id === editingTableCell.shapeId ? { ...s, cells: updatedCells } : s
                )
              )
            }
            setEditingTableCell(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur()
            }
          }}
          className="absolute outline-none border-2 border-indigo-500 px-2 py-1.5 font-normal text-[13px] z-30 shadow-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
          style={{
            left: editingTableCell.clientX,
            top: editingTableCell.clientY,
            width: editingTableCell.width,
            height: editingTableCell.height,
            resize: "none",
            lineHeight: "normal",
          }}
        />
      )}

      {/* STICKY NOTE TEXT EDITING OVERLAY */}
      {editingStickyNoteInput && (
        <textarea
          autoFocus
          value={editingStickyNoteInput.value}
          onChange={(e) => setEditingStickyNoteInput({ ...editingStickyNoteInput, value: e.target.value })}
          onBlur={() => {
            updateShape(editingStickyNoteInput.id, { text: editingStickyNoteInput.value })
            commitToHistory(
              useBoardStore.getState().shapes.map((s) =>
                s.id === editingStickyNoteInput.id ? { ...s, text: editingStickyNoteInput.value } : s
              )
            )
            setEditingStickyNoteInput(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur()
            }
          }}
          placeholder="Type in note..."
          className="absolute outline-none border-2 border-indigo-600 rounded-xl p-4 font-semibold text-sm z-30 shadow-lg text-zinc-800"
          style={{
            left: editingStickyNoteInput.clientX,
            top: editingStickyNoteInput.clientY,
            width: editingStickyNoteInput.width,
            height: editingStickyNoteInput.height,
            backgroundColor: shapes.find((s) => s.id === editingStickyNoteInput.id)?.color || "#FEF3C7",
            color: "#1f2937",
            resize: "none",
          }}
        />
      )}

      {/* IMAGE FILE INPUT */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* TEXT BOX CREATION OVERLAY */}
      {textInput && (
        <textarea
          autoFocus
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onBlur={() => {
            if (textInput.value.trim()) {
              const lines = textInput.value.split("\n")
              const maxLineLength = lines.reduce((max, l) => Math.max(max, l.length), 0)
              addShape({
                type: "text",
                x: textInput.x,
                y: textInput.y,
                width: maxLineLength * 8.5 + 16,
                height: lines.length * 20 + 8,
                stroke: strokeColor,
                fill: "transparent",
                text: textInput.value,
              })
            }
            setTextInput(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.blur() // Save text
            } else if (e.key === "Escape") {
              setTextInput(null) // Cancel text
            }
          }}
          placeholder="Type something..."
          className="absolute bg-white dark:bg-zinc-900 outline-none border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-2 font-semibold text-sm z-30 shadow-lg text-zinc-800 dark:text-zinc-100"
          style={{
            left: textInput.clientX - 10,
            top: textInput.clientY - 10,
            minWidth: "160px",
            minHeight: "48px",
          }}
        />
      )}

      {/* HEADER SECTION */}
      <header className="absolute top-0 left-0 right-0 h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 flex items-center justify-between bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.88 3.549L5.804 14.624a1.5 1.5 0 00-.398.67l-1.002 3.829a.5.5 0 00.612.612l3.829-1.002a1.5 1.5 0 00.67-.398L20.45 7.12a2.25 2.25 0 10-3.57-3.57z" />
              </svg>
            </div>
            <span className="text-md font-black tracking-wide text-indigo-650 dark:text-indigo-400">
              SketchPad Pro
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-250 dark:bg-zinc-800" />

          {/* Dynamic Board Title + Autosave badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
              {boardTitle}
            </span>
            
            {/* Sync status tag */}
            {saveStatus === "saving" && (
              <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 animate-pulse flex items-center gap-1">
                <svg className="w-3 h-3 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Synced
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Sync Error
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-250 dark:bg-zinc-800" />

          {/* Main navigation */}
          <nav className="flex items-center gap-5 text-sm font-bold text-zinc-500">
            <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-450 hover:text-indigo-700 border-b-2 border-indigo-600 pb-0.5 transition-colors">
              Files
            </Link>
            
            {/* Insert Dropdown Menu */}
            <div ref={insertMenuRef} className="relative">
              <button
                onClick={() => setIsInsertOpen(!isInsertOpen)}
                className={`hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 ${
                  isInsertOpen ? "text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-900" : ""
                }`}
              >
                Insert
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isInsertOpen ? "rotate-180 text-indigo-600 dark:text-indigo-450" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {isInsertOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl py-1.5 z-30 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {[
                    {
                      id: "image",
                      label: "Image",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                        </svg>
                      ),
                    },
                    {
                      id: "sticky-note",
                      label: "Sticky Note",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75H16.5Z" />
                        </svg>
                      ),
                    },
                    {
                      id: "frame",
                      label: "Frame",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18M18 3v18M3 6h18M3 18h18" />
                        </svg>
                      ),
                    },
                    {
                      id: "table",
                      label: "Table",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3.75 10.5h16.5M3.75 15h16.5M9 3.75v16.5M15 3.75v16.5" />
                        </svg>
                      ),
                    },
                    {
                      id: "comment",
                      label: "Comment",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.073.084-.047.211.052.261a12.518 12.518 0 003.585.524c.783 0 1.533-.117 2.234-.336.56-.176 1.166.082 1.57.518L12 20.25z" />
                        </svg>
                      ),
                    },
                    {
                      id: "embed",
                      label: "Embed/Link",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      ),
                    },
                    {
                      id: "shape-library",
                      label: "Shape Library",
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      ),
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleInsertOptionClick(option.id)}
                      className="w-full px-3.5 py-1.5 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-55 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="text-zinc-400 dark:text-zinc-500">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              View
            </button>
          </nav>
        </div>

        {/* Header Right collaboration */}
        <div className="flex items-center gap-4">
          
          {/* Active avatars */}
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-650" title="Jamie">
              JM
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-650" title="Alex">
              AL
            </div>
            {isLoaded && user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Active User"
                className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 object-cover"
                title={user.fullName || "Me"}
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                ME
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-250 dark:bg-zinc-800" />

          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer">
            Share
          </button>

          <button
            onClick={undo}
            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer shadow-sm bg-white dark:bg-zinc-900"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          <button
            onClick={redo}
            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer shadow-sm bg-white dark:bg-zinc-900"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </header>

      {/* FLOATING INTERACTIVE TOOLBAR (Matches screenshot active/inactive styling) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-lg flex items-center gap-1 z-20">
        {[
          {
            id: "select",
            name: "Select",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.026 9.348l-8.625 8.624L4 12l3.242-2.399L15.026 9.348z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.026 9.348l3.149 3.149-8.624 8.624H6.402l-.001-3.149 8.625-8.624z" />
              </svg>
            ),
          },
          {
            id: "rectangle",
            name: "Rectangle",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <rect x="4" y="4" width="16" height="16" rx="1.5" />
              </svg>
            ),
          },
          {
            id: "circle",
            name: "Circle",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="8" />
              </svg>
            ),
          },
          {
            id: "arrow",
            name: "Arrow",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            ),
          },
          {
            id: "line",
            name: "Line",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M4 20L20 4" />
              </svg>
            ),
          },
        ].map((tool) => {
          const isSelected = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as any)
                setSelectedShapeId(null) // clear selection on tool change
              }}
              className={`p-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-650 text-white shadow-sm scale-102"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          )
        })}

        {/* Separator line */}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        {[
          {
            id: "pencil",
            name: "Pencil",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            ),
          },
          {
            id: "text",
            name: "Text",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M12 6v14m-3 0h6" />
              </svg>
            ),
          },
          {
            id: "eraser",
            name: "Eraser",
            icon: (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            ),
          },
        ].map((tool) => {
          const isSelected = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as any)
                setSelectedShapeId(null)
              }}
              className={`p-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-650 text-white shadow-sm scale-102"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          )
        })}
      </div>

      {/* STYLE PANEL (Left overlay) */}
      <aside className="absolute left-4 top-20 w-60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-lg p-5 flex flex-col gap-6 z-10">
        <div>
          <h2 className="text-md font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            Properties
          </h2>
          <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
            Adjust stroke & color
          </p>
        </div>

        {/* Sticky Note Color (only shown when a sticky note is selected) */}
        {selectedShape && selectedShape.type === "sticky-note" && (
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Note Color
            </label>
            <div className="flex items-center gap-2">
              {[
                { value: "#FEF3C7", label: "Yellow" },
                { value: "#FCE7F3", label: "Pink" },
                { value: "#E0F2FE", label: "Blue" },
                { value: "#D1FAE5", label: "Green" },
              ].map((color) => {
                const isColorSelected = selectedShape.color === color.value
                return (
                  <button
                    key={color.value}
                    onClick={() => {
                      updateShape(selectedShape.id, { color: color.value })
                      commitToHistory(shapes.map(s => s.id === selectedShape.id ? { ...s, color: color.value } : s))
                    }}
                    className={`w-6 h-6 rounded-full border cursor-pointer transition-all ${
                      isColorSelected
                        ? "ring-2 ring-indigo-600/30 scale-110 border-indigo-650"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Stroke Color */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Stroke Color
          </label>
          <div className="flex items-center gap-2">
            {[
              { value: "#4f46e5", label: "Indigo" },
              { value: "#059669", label: "Green" },
              { value: "#dc2626", label: "Red" },
              { value: "#d97706", label: "Orange" },
              { value: "#0f172a", label: "Slate" },
            ].map((color) => {
              const isColorSelected = strokeColor === color.value
              return (
                <button
                  key={color.value}
                  onClick={() => setStrokeColor(color.value)}
                  className={`w-6 h-6 rounded-full border cursor-pointer transition-all ${
                    isColorSelected
                      ? "ring-2 ring-indigo-600/30 scale-110 border-indigo-650"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              )
            })}
          </div>
        </div>

        {/* Fill Color */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Fill Color
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFillColor("transparent")}
              className={`w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center cursor-pointer transition-all relative ${
                fillColor === "transparent"
                  ? "ring-2 ring-indigo-600/30 scale-110 border-indigo-650"
                  : ""
              }`}
              title="Transparent"
            >
              <div className="w-5 h-0.5 bg-red-500 rotate-45" />
            </button>

            {[
              { value: "#e0e7ff", label: "Light Indigo" },
              { value: "#d1fae5", label: "Light Green" },
              { value: "#fee2e2", label: "Light Red" },
            ].map((color) => {
              const isColorSelected = fillColor === color.value
              return (
                <button
                  key={color.value}
                  onClick={() => setFillColor(color.value)}
                  className={`w-6 h-6 rounded-full border border-zinc-250 dark:border-zinc-800 cursor-pointer transition-all ${
                    isColorSelected
                      ? "ring-2 ring-indigo-600/30 scale-110 border-indigo-650"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              )
            })}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <span>Stroke Width</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300 text-xs">
              {strokeWidth}px
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handleExportPNG}
            className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-400 transition-colors text-xs cursor-pointer shadow-sm shadow-indigo-600/5 text-center"
          >
            Export as PNG
          </button>
          
          <button
            onClick={clearShapes}
            className="w-full py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-55 text-zinc-650 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-all text-xs font-bold cursor-pointer bg-white/50 dark:bg-zinc-900/50"
          >
            Clear All Shapes
          </button>
        </div>
      </aside>

      {/* ZOOM CONTROLS (Bottom-left overlay) */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-full shadow-md flex items-center gap-4 z-10 text-xs font-bold text-zinc-750">
        <button
          onClick={() => setZoom(Math.max(25, zoom - 25))}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          —
        </button>
        <span className="font-mono min-w-[36px] text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 25))}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          +
        </button>
        <div className="w-px h-3 bg-zinc-250 dark:bg-zinc-800" />
        <button
          onClick={() => setZoom(100)}
          className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
