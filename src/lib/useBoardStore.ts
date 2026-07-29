import { create } from "zustand"

export interface Shape {
  id: string
  type: "rectangle" | "ellipse" | "line" | "pencil" | "text" | "arrow" | "sticky-note" | "image" | "frame" | "table"
  x: number
  y: number
  width: number
  height: number
  stroke: string
  fill: string
  strokeWidth?: number
  points?: { x: number; y: number }[]
  text?: string
  color?: string // For sticky-note background/swatch color
  url?: string // For image URL
  name?: string // For frame label
  parentFrameId?: string | null // Reference to container frame
  rows?: number // For table rows
  cols?: number // For table columns
  cells?: string[][] // For table cell text content
  colWidths?: number[] // For table column widths
  rowHeights?: number[] // For table row heights
}

interface BoardState {
  shapes: Shape[]
  selectedShapeId: string | null
  selectedShapeIds: string[]
  history: Shape[][]
  historyIndex: number
  
  setSelectedShapeId: (id: string | null) => void
  setSelectedShapeIds: (ids: string[]) => void
  addShape: (shape: Omit<Shape, "id">) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  updateShapeTransient: (id: string, updates: Partial<Shape>) => void
  deleteSelectedShape: () => void
  setShapes: (shapes: Shape[]) => void
  clearShapes: () => void
  
  undo: () => void
  redo: () => void
  commitToHistory: (newShapes: Shape[]) => void
}

const INITIAL_SHAPES: Shape[] = [
  // 1. Sketchy Rectangle (indigo outline with transparent fill)
  {
    id: "rect-1",
    type: "rectangle",
    x: 180,
    y: 160,
    width: 220,
    height: 140,
    stroke: "#4f46e5",
    fill: "transparent",
    strokeWidth: 2.5,
  },
  // 2. Sketchy Ellipse/Circle (green outline with transparent fill)
  {
    id: "ellipse-1",
    type: "ellipse",
    x: 500,
    y: 150,
    width: 160,
    height: 160,
    stroke: "#059669",
    fill: "transparent",
    strokeWidth: 2.5,
  },
  // 3. Sketchy Line (red diagonal line)
  {
    id: "line-1",
    type: "line",
    x: 200,
    y: 400,
    width: 450,
    height: 120,
    stroke: "#dc2626",
    fill: "transparent",
    strokeWidth: 3,
  },
]

const getShapeBoundingBox = (shape: Shape) => {
  if (shape.type === "pencil" && shape.points && shape.points.length > 0) {
    const xs = shape.points.map((p) => p.x)
    const ys = shape.points.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }
  const x = Math.min(shape.x, shape.x + shape.width)
  const y = Math.min(shape.y, shape.y + shape.height)
  const width = Math.abs(shape.width)
  const height = Math.abs(shape.height)
  return { x, y, width, height }
}

const updateFrameRelationships = (shapes: Shape[]): Shape[] => {
  const frames = shapes.filter(s => s.type === "frame")
  return shapes.map(shape => {
    if (shape.type === "frame") return shape
    
    const sBox = getShapeBoundingBox(shape)
    const containingFrame = [...frames].reverse().find(frame => {
      const fBox = getShapeBoundingBox(frame)
      return (
        sBox.x >= fBox.x &&
        sBox.x + sBox.width <= fBox.x + fBox.width &&
        sBox.y >= fBox.y &&
        sBox.y + sBox.height <= fBox.y + fBox.height
      )
    })
    
    return {
      ...shape,
      parentFrameId: containingFrame ? containingFrame.id : null
    }
  })
}

export const useBoardStore = create<BoardState>((set) => ({
  shapes: INITIAL_SHAPES,
  selectedShapeId: null,
  selectedShapeIds: [],
  history: [INITIAL_SHAPES],
  historyIndex: 0,

  setSelectedShapeId: (id) => set({ selectedShapeId: id, selectedShapeIds: id ? [id] : [] }),
  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids, selectedShapeId: ids[0] || null }),

  commitToHistory: (newShapes) =>
    set((state) => {
      const cleanHistory = state.history.slice(0, state.historyIndex + 1)
      const nextHistory = [...cleanHistory, newShapes]
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        shapes: newShapes,
      }
    }),

  addShape: (shape) =>
    set((state) => {
      const newShape: Shape = {
        ...shape,
        id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
      const newShapes = updateFrameRelationships([...state.shapes, newShape])
      
      const cleanHistory = state.history.slice(0, state.historyIndex + 1)
      const nextHistory = [...cleanHistory, newShapes]
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        shapes: newShapes,
        selectedShapeId: newShape.id,
        selectedShapeIds: [newShape.id],
      }
    }),

  updateShape: (id, updates) =>
    set((state) => {
      const newShapes = updateFrameRelationships(state.shapes.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ))
      const cleanHistory = state.history.slice(0, state.historyIndex + 1)
      const nextHistory = [...cleanHistory, newShapes]
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        shapes: newShapes,
      }
    }),

  updateShapeTransient: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  deleteSelectedShape: () =>
    set((state) => {
      if (state.selectedShapeIds.length === 0 && !state.selectedShapeId) return {}
      const idsToDelete = state.selectedShapeIds.length > 0 ? state.selectedShapeIds : [state.selectedShapeId!]
      const newShapes = updateFrameRelationships(state.shapes.filter((s) => !idsToDelete.includes(s.id)))
      const cleanHistory = state.history.slice(0, state.historyIndex + 1)
      const nextHistory = [...cleanHistory, newShapes]
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        shapes: newShapes,
        selectedShapeId: null,
        selectedShapeIds: [],
      }
    }),

  setShapes: (shapes) =>
    set((state) => {
      const newShapes = updateFrameRelationships(shapes)
      const cleanHistory = state.history.slice(0, state.historyIndex + 1)
      const nextHistory = [...cleanHistory, newShapes]
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        shapes: newShapes,
      }
    }),

  clearShapes: () =>
    set((state) => {
      const newShapes: Shape[] = []
      const cleanHistory = state.history.slice(0, state.historyIndex + 1)
      const nextHistory = [...cleanHistory, newShapes]
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
        shapes: newShapes,
        selectedShapeId: null,
        selectedShapeIds: [],
      }
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex === 0) return {}
      const prevIndex = state.historyIndex - 1
      return {
        historyIndex: prevIndex,
        shapes: state.history[prevIndex],
        selectedShapeId: null,
        selectedShapeIds: [],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return {}
      const nextIndex = state.historyIndex + 1
      return {
        historyIndex: nextIndex,
        shapes: state.history[nextIndex],
        selectedShapeId: null,
        selectedShapeIds: [],
      }
    }),
}))
