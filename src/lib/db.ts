import fs from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "boards.json")

export interface Board {
  id: string
  title: string
  lastEdited: string
  template: string
  createdAt: string
  data?: any[] // shapes JSONB array
}

const DEFAULT_BOARDS: Board[] = [
  {
    id: "board-1",
    title: "Q4 Strategy",
    lastEdited: "Last edited 2 hours ago",
    template: "mindmap",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: [
      {
        id: "rect-1",
        type: "rectangle",
        x: 180,
        y: 160,
        width: 220,
        height: 140,
        stroke: "#4f46e5",
        fill: "#e0e7ff",
        strokeWidth: 2.5,
      },
      {
        id: "ellipse-1",
        type: "ellipse",
        x: 500,
        y: 150,
        width: 160,
        height: 160,
        stroke: "#059669",
        fill: "#d1fae5",
        strokeWidth: 2.5,
      },
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
    ],
  },
  {
    id: "board-2",
    title: "Feature Ideation",
    lastEdited: "Last edited 5 hours ago",
    template: "wireframe",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    data: [],
  },
  {
    id: "board-3",
    title: "User Flow V1",
    lastEdited: "Last edited yesterday",
    template: "flowchart",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: [],
  },
  {
    id: "board-4",
    title: "Sprint Planning",
    lastEdited: "Last edited 2 days ago",
    template: "sprint",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    data: [],
  },
]

export function getBoards(): Board[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_BOARDS, null, 2))
      return DEFAULT_BOARDS
    }
    const data = fs.readFileSync(DB_PATH, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading database", error)
    return DEFAULT_BOARDS
  }
}

export function saveBoards(boards: Board[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(boards, null, 2))
  } catch (error) {
    console.error("Error saving database", error)
  }
}
