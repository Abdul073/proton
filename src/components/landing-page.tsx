"use client"

import * as React from "react"
import { useUser, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"
import { Inter, Caveat } from "next/font/google"
import rough from "roughjs"

const inter = Inter({ subsets: ["latin"] })
const caveat = Caveat({ subsets: ["latin"] })

// Helper type for canvas drawing points
interface Point {
  x: number
  y: number
}

// ---------------------------------------------------------
// Component 1: HandDrawnOutline
// Renders a hand-drawn SVG ellipse and underline overlay
// around text for the CTA buttons
// ---------------------------------------------------------
export function HandDrawnOutline({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [paths, setPaths] = React.useState<string[]>([])
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return
    const w = dimensions.width
    const h = dimensions.height
    const generator = rough.generator()

    // Create a sketchy oval outline around the text
    const paddingX = 14
    const paddingY = 8
    const oval = generator.ellipse(w / 2, h / 2, w + paddingX * 2, h + paddingY * 2, {
      stroke: "#F2A93B",
      strokeWidth: 2,
      roughness: 1.5,
    })

    // Create a double sketchy underline
    const underline = generator.line(paddingX, h + 5, w - paddingX, h + 7, {
      stroke: "#F2A93B",
      strokeWidth: 1.8,
      roughness: 1.2,
    })

    const combinedPaths = [
      ...generator.toPaths(oval),
      ...generator.toPaths(underline),
    ].map((p) => p.d)

    setPaths(combinedPaths)
  }, [dimensions])

  return (
    <div ref={containerRef} className="relative inline-block px-4 py-2 select-none group cursor-pointer">
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{
          width: "100%",
          height: "100%",
          transform: "scale(1.05)",
        }}
      >
        {paths.map((d, idx) => (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke="#F2A93B"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300 group-hover:stroke-[#ffd384] group-hover:scale-[1.02]"
          />
        ))}
      </svg>
      <span className="relative z-10 font-bold text-white transition-colors duration-200 group-hover:text-[#F2A93B]">
        {children}
      </span>
    </div>
  )
}

// ---------------------------------------------------------
// Component 2: MiniCanvas
// An interactive responsive canvas drawing workspace with Rough.js.
// Pre-renders a sketchy rectangle, circle, and pointing arrow
// with editable text.
// ---------------------------------------------------------
export function MiniCanvas() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = React.useState<Point[][]>([])
  const [currentStroke, setCurrentStroke] = React.useState<Point[]>([])
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [text, setText] = React.useState("try drawing here")
  const [canvasSize, setCanvasSize] = React.useState({ width: 500, height: 350 })

  // Sketchy arrow drawer helper
  const drawSketchyArrow = (rc: any, x1: number, y1: number, x2: number, y2: number, options: any) => {
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

  // Handle resizing and matching dimensions
  React.useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        // Keep a neat 4:3 or 1.4:1 ratio
        const height = Math.max(300, Math.min(420, width * 0.72))
        setCanvasSize({ width, height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Core drawing logic
  const render = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Setup high DPI canvas scaling
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize.width * dpr
    canvas.height = canvasSize.height * dpr
    ctx.scale(dpr, dpr)

    // Scale coordinates from a virtual 600x450 coordinate system to layout system
    const scaleX = canvasSize.width / 600
    const scaleY = canvasSize.height / 450
    ctx.scale(scaleX, scaleY)

    const rc = rough.canvas(canvas)

    // 1. Pre-render a sketchy amber rectangle (top-left)
    rc.rectangle(70, 90, 230, 140, {
      stroke: "#F2A93B",
      strokeWidth: 2,
      roughness: 1.5,
    })

    // 2. Pre-render a sketchy circle (bottom-right)
    rc.ellipse(390, 260, 140, 140, {
      stroke: "#a5b4fc",
      strokeWidth: 2,
      roughness: 1.3,
    })

    // 3. Pre-render a sketchy arrow pointing from the "try drawing here" text to the rectangle
    drawSketchyArrow(rc, 450, 65, 340, 115, {
      stroke: "#F2A93B",
      strokeWidth: 1.8,
      roughness: 1.5,
    })

    // 4. Render user strokes
    strokes.forEach((stroke) => {
      if (stroke.length < 2) return
      const pts = stroke.map((p) => [p.x, p.y] as [number, number])
      rc.linearPath(pts, {
        stroke: "#F2A93B",
        strokeWidth: 2.5,
        roughness: 0.8,
      })
    })

    // 5. Render active stroke
    if (currentStroke.length >= 2) {
      const pts = currentStroke.map((p) => [p.x, p.y] as [number, number])
      rc.linearPath(pts, {
        stroke: "#F2A93B",
        strokeWidth: 2.5,
        roughness: 0.8,
      })
    }
  }, [canvasSize, strokes, currentStroke])

  React.useEffect(() => {
    render()
  }, [render])

  // Map mouse/touch to virtual 600x450 layout coordinate space
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    let clientX = 0
    let clientY = 0

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = ((clientX - rect.left) / rect.width) * 600
    const y = ((clientY - rect.top) / rect.height) * 450
    return { x, y }
  }

  // Draw event handlers
  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling on touch devices while drawing
    if (e.cancelable) {
      e.preventDefault()
    }
    const coord = getCoordinates(e)
    setIsDrawing(true)
    setCurrentStroke([coord])
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const coord = getCoordinates(e)
    setCurrentStroke((prev) => [...prev, coord])
  }

  const handleEnd = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, currentStroke])
    }
    setCurrentStroke([])
  }

  const handleReset = () => {
    setStrokes([])
    setCurrentStroke([])
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#151413] border border-zinc-800 rounded-2xl p-1 shadow-inner select-none overflow-hidden group/canvas">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="w-full h-full cursor-crosshair rounded-xl"
        style={{ touchAction: "none" }}
      />

      {/* Transparent input box aligned with the sketchy arrow tail */}
      <div 
        className="absolute"
        style={{
          top: "6.5%",
          right: "8%",
          width: "28%",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type here..."
          className={`${caveat.className} w-full text-center text-xl md:text-2xl font-semibold text-[#F2A93B] bg-transparent outline-none border-none resize-none rotate-[-6deg] select-text placeholder-[#F2A93B]/50 leading-tight focus:ring-0`}
          rows={2}
          style={{
            fontFamily: "Caveat, cursive",
          }}
        />
      </div>

      {/* Floating clear canvas trigger */}
      {strokes.length > 0 && (
        <button
          onClick={handleReset}
          className="absolute bottom-3 right-3 text-xs bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors select-none font-medium cursor-pointer"
        >
          Reset canvas
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// Component 3: FeatureShowcase
// Feature section showing annotated sketches using Rough.js
// ---------------------------------------------------------
export function FeatureShowcase() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set layout dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Virtual grid scale (800x450 coordinate space)
    const scaleX = dimensions.width / 800
    const scaleY = dimensions.height / 450
    ctx.scale(scaleX, scaleY)

    const rc = rough.canvas(canvas)

    // 1. Draw whiteboard wireframe elements in the background
    // Outer border of mock whiteboard workspace
    rc.rectangle(120, 80, 560, 290, {
      stroke: "rgba(255, 255, 255, 0.08)",
      strokeWidth: 2,
    })

    // Mock header/toolbar inside the whiteboard
    rc.line(120, 115, 680, 115, { stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 })
    rc.line(220, 80, 220, 115, { stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 })

    // Draw some shapes inside the whiteboard
    // Gold circle
    rc.ellipse(320, 210, 80, 80, {
      stroke: "#F2A93B",
      strokeWidth: 2,
      roughness: 1.4,
    })

    // White/lavender rectangle with sketchy fill
    rc.rectangle(420, 170, 130, 90, {
      stroke: "#a5b4fc",
      strokeWidth: 1.8,
      fill: "rgba(165, 180, 252, 0.06)",
      fillStyle: "hachure",
      hachureAngle: 60,
      hachureGap: 8,
      roughness: 1.2,
    })

    // 2. Draw three yellow pointing arrows from labels to details
    // Arrow 1: pointing from label (top-left) to shapes
    // Label: "Every shape looks hand-drawn" (coordinates approx. x=70, y=30)
    // Points to circle: target x=280, y=190
    rc.line(150, 45, 260, 175, {
      stroke: "#F2A93B",
      strokeWidth: 2,
      roughness: 1.3,
    })
    // Arrowhead 1
    const a1 = Math.atan2(175 - 45, 260 - 150)
    rc.line(260, 175, 260 - 12 * Math.cos(a1 - Math.PI / 6), 175 - 12 * Math.sin(a1 - Math.PI / 6), { stroke: "#F2A93B", strokeWidth: 2 })
    rc.line(260, 175, 260 - 12 * Math.cos(a1 + Math.PI / 6), 175 - 12 * Math.sin(a1 + Math.PI / 6), { stroke: "#F2A93B", strokeWidth: 2 })

    // Arrow 2: pointing from label (middle-right) to cursor
    // Label: "See everyone's cursor, live" (coordinates approx. x=730, y=180)
    // Points to multiplayer cursor: target x=540, y=150
    rc.line(710, 190, 560, 155, {
      stroke: "#F2A93B",
      strokeWidth: 2,
      roughness: 1.3,
    })
    // Arrowhead 2
    const a2 = Math.atan2(155 - 190, 560 - 710)
    rc.line(560, 155, 560 - 12 * Math.cos(a2 - Math.PI / 6), 155 - 12 * Math.sin(a2 - Math.PI / 6), { stroke: "#F2A93B", strokeWidth: 2 })
    rc.line(560, 155, 560 - 12 * Math.cos(a2 + Math.PI / 6), 155 - 12 * Math.sin(a2 + Math.PI / 6), { stroke: "#F2A93B", strokeWidth: 2 })

    // Arrow 3: pointing from label (bottom-center) to comment bubble
    // Label: "Comment right on the sketch" (coordinates approx. x=380, y=410)
    // Points to comment: target x=430, y=340
    rc.line(390, 400, 420, 350, {
      stroke: "#F2A93B",
      strokeWidth: 2,
      roughness: 1.3,
    })
    // Arrowhead 3
    const a3 = Math.atan2(350 - 400, 420 - 390)
    rc.line(420, 350, 420 - 12 * Math.cos(a3 - Math.PI / 6), 350 - 12 * Math.sin(a3 - Math.PI / 6), { stroke: "#F2A93B", strokeWidth: 2 })
    rc.line(420, 350, 420 - 12 * Math.cos(a3 + Math.PI / 6), 350 - 12 * Math.sin(a3 + Math.PI / 6), { stroke: "#F2A93B", strokeWidth: 2 })

  }, [dimensions])

  return (
    <div ref={containerRef} className="relative w-full aspect-[16/9] md:aspect-[1.8/1] select-none mt-12 bg-[#151413] border border-zinc-800 rounded-3xl overflow-hidden p-6">
      {/* Background Dotted Grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      {/* Rough.js Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* HTML Elements Layer */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        
        {/* Mock Toolbar Left */}
        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 bg-[#1C1B19]/90 border border-zinc-800 rounded-xl p-2 flex flex-col gap-2 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-[#F2A93B]/10 border border-[#F2A93B]/30 flex items-center justify-center text-[#F2A93B]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
          </div>
          <div className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        </div>

        {/* Mock Multiplayer Cursor 1 */}
        <div className="absolute top-[31%] left-[64%] flex items-center gap-1.5 shadow-md">
          <svg className="w-4 h-4 text-[#F2A93B] drop-shadow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3v15.25l3.75-3.75 3 7.5 2.5-1-3-7.5h6.25L4.5 3z" />
          </svg>
          <span className="bg-[#F2A93B] text-black text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">Sarah</span>
        </div>

        {/* Mock Multiplayer Cursor 2 */}
        <div className="absolute top-[48%] left-[45%] flex items-center gap-1.5 shadow-md">
          <svg className="w-4 h-4 text-[#a5b4fc] drop-shadow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3v15.25l3.75-3.75 3 7.5 2.5-1-3-7.5h6.25L4.5 3z" />
          </svg>
          <span className="bg-[#a5b4fc] text-black text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">Alex</span>
        </div>

        {/* Mock Comment Bubble */}
        <div className="absolute right-[36%] bottom-[24%] bg-[#1C1B19] border border-zinc-800 rounded-xl p-2.5 flex items-center gap-2 shadow-lg max-w-[160px] md:max-w-none">
          <div className="w-6 h-6 rounded-full bg-[#a5b4fc]/20 border border-[#a5b4fc]/40 flex items-center justify-center text-[10px] font-bold text-[#a5b4fc]">
            JD
          </div>
          <div className="text-left">
            <div className="text-[9px] text-zinc-500 font-bold leading-none">John Doe</div>
            <div className="text-[11px] text-[#F9F6F0] font-semibold mt-0.5">"Looks amazing!"</div>
          </div>
        </div>

        {/* Labels positioned relative to the overall coordinate layout */}
        {/* Label 1: Shapes (top-left) */}
        <div className="absolute top-[4%] left-[6%]">
          <span
            className={`${caveat.className} text-xl md:text-2xl text-[#F2A93B] block rotate-[-8deg]`}
            style={{ fontFamily: "Caveat, cursive" }}
          >
            Every shape looks hand-drawn
          </span>
        </div>

        {/* Label 2: Cursors (middle-right) */}
        <div className="absolute top-[42%] right-[2%]">
          <span
            className={`${caveat.className} text-xl md:text-2xl text-[#F2A93B] block rotate-[6deg]`}
            style={{ fontFamily: "Caveat, cursive" }}
          >
            See everyone's cursor, live
          </span>
        </div>

        {/* Label 3: Comment (bottom-center) */}
        <div className="absolute bottom-[3%] left-[34%]">
          <span
            className={`${caveat.className} text-xl md:text-2xl text-[#F2A93B] block rotate-[-3deg]`}
            style={{ fontFamily: "Caveat, cursive" }}
          >
            Comment right on the sketch
          </span>
        </div>

      </div>
    </div>
  )
}

// ---------------------------------------------------------
// Main Component: LandingPage
// ---------------------------------------------------------
export default function LandingPage() {
  const { user } = useUser()

  return (
    <div className={`flex flex-col min-h-screen bg-[#1C1B19] text-[#F9F6F0] selection:bg-[#F2A93B]/20 selection:text-[#F2A93B] ${inter.className}`}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1C1B19]/80 border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-wider text-white hover:text-[#F2A93B] transition-colors">
              PROTON
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a 
              href="#features" 
              className="hover:text-white transition-colors border-b border-[#F2A93B] pb-0.5 text-white"
            >
              Features
            </a>
            <a href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-zinc-400 hover:text-white px-4 py-2 transition-colors cursor-pointer">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-semibold bg-[#F2A93B] hover:bg-[#e09830] text-black px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
                  Start Drawing Free
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <a 
                href="/dashboard" 
                className="text-sm font-semibold bg-[#F2A93B] hover:bg-[#e09830] text-black px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Go to Workspace
              </a>
              <div className="h-8 w-8 rounded-full border border-zinc-800 overflow-hidden flex items-center justify-center bg-zinc-900 shadow-inner">
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col gap-24 relative z-10">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero */}
          <div className="lg:col-span-5 flex flex-col items-start text-left gap-6">
            <div className="inline-flex items-center border border-[#F2A93B]/30 bg-[#F2A93B]/5 rounded-full px-3.5 py-1 text-[11px] font-black tracking-widest text-[#F2A93B] uppercase">
              Version 2.0 Early Access
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight leading-[1.1] text-white">
              Draw it before you <span className="text-[#F2A93B] italic font-semibold">explain it.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              A shared canvas where every line looks hand-drawn, and your team sees each other's cursors moving in real time. No slides, no screen share, just draw.
            </p>

            <div className="mt-4">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <div className="inline-block">
                    <HandDrawnOutline>Start Sketching — It's Free</HandDrawnOutline>
                  </div>
                </SignUpButton>
              </Show>
              
              <Show when="signed-in">
                <a href="/dashboard" className="inline-block">
                  <HandDrawnOutline>Go to Workspace</HandDrawnOutline>
                </a>
              </Show>
            </div>
          </div>

          {/* Right Hero (Embedded mini-canvas) */}
          <div className="lg:col-span-7 h-[360px] md:h-[450px] w-full">
            <MiniCanvas />
          </div>
        </section>

        {/* Feature Section (Sketch Annotation) */}
        <section id="features" className="w-full text-center flex flex-col gap-6 py-10">
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Everything you need, nothing you{" "}
              <span 
                className={`${caveat.className} text-[#F2A93B] text-4xl md:text-5xl inline-block rotate-[-4deg] translate-y-1 font-bold`}
                style={{ fontFamily: "Caveat, cursive" }}
              >
                don't
              </span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              No complex layouts, no heavy frameworks. Simple vector sketches that look hand-drawn and make ideas float instantly.
            </p>
          </div>

          <FeatureShowcase />
        </section>

        {/* Asymmetric Features and CTA Grid Section */}
        <section className="w-full flex flex-col gap-6">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Card 1: Precision over speed */}
            <div className="md:w-[62%] bg-[#22211F] border border-zinc-800/80 rounded-2xl p-8 flex flex-col items-start gap-4 text-left">
              {/* Compass Badge */}
              <div className="w-10 h-10 rounded-xl bg-[#1C1B19] border border-zinc-800 flex items-center justify-center text-[#F2A93B] shadow-inner">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9.7 13.5 2-8 2 8" />
                  <path d="M5 20h14" />
                  <path d="M12 3v2" />
                  <path d="M8.5 14h7" />
                  <circle cx="12" cy="18" r="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Precision over speed</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                While other tools focus on quick doodles, Proton is built for technical documentation. Snap to grids, perfect geometry, and mathematical constraints ensure your sketches are ready for production.
              </p>
            </div>

            {/* Card 2: Crafted for Scale */}
            <div className="md:w-[38%] bg-[#22211F] border border-zinc-800/80 rounded-2xl p-8 flex flex-col justify-center items-start text-left">
              <span 
                className={`${caveat.className} text-[#F2A93B] text-3xl font-bold italic mb-2 block rotate-[-3deg]`}
                style={{ fontFamily: "Caveat, cursive" }}
              >
                Crafted for Scale
              </span>
              <h3 className="text-lg font-bold text-white mb-2">Enterprise Ready</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                SOC2 compliant storage for your logic.
              </p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Card 3: Git Integration */}
            <div className="md:w-[38%] bg-[#22211F] border border-zinc-800/80 rounded-2xl p-8 flex flex-col items-start gap-4 text-left">
              {/* Git Branch Badge */}
              <div className="w-10 h-10 rounded-xl bg-[#1C1B19] border border-zinc-800 flex items-center justify-center text-[#F2A93B] shadow-inner">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="3" x2="6" y2="15"></line>
                  <circle cx="18" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M18 9a9 9 0 0 1-9 9"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Git Integration</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Commit your canvases directly to your codebase as native SVG or JSON structures.
              </p>
            </div>

            {/* Card 4: Ready to prototype? Banner */}
            <div className="md:w-[62%] bg-[#F2A93B] text-[#1C1B19] rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
              {/* Content */}
              <div className="flex flex-col items-start text-left gap-3 max-w-md relative z-10">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none text-zinc-950">
                  Ready to prototype?
                </h2>
                <p className="text-[#3b3225] font-semibold text-sm leading-snug">
                  Join 50,000+ engineers designing the next generation of systems.
                </p>
                <div className="mt-2">
                  <Show when="signed-out">
                    <SignUpButton mode="modal">
                      <button className="h-11 px-6 rounded-xl font-bold bg-[#1C1B19] text-white hover:bg-zinc-900 transition-colors shadow-lg cursor-pointer text-sm">
                        Get Proton Free
                      </button>
                    </SignUpButton>
                  </Show>

                  <Show when="signed-in">
                    <a 
                      href="/dashboard" 
                      className="h-11 px-6 rounded-xl font-bold bg-[#1C1B19] text-white hover:bg-zinc-900 transition-colors flex items-center justify-center shadow-lg cursor-pointer text-sm"
                    >
                      Go to Workspace
                    </a>
                  </Show>
                </div>
              </div>

              {/* Rocket Graphic Card */}
              <div className="relative z-10 w-28 h-28 bg-[#1C1B19] rounded-2xl flex items-center justify-center text-[#F2A93B] border border-zinc-800 shadow-2xl shrink-0">
                <svg className="w-12 h-12 transform rotate-45 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#1C1B19] py-12 px-6 text-zinc-500 text-sm mt-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-base font-extrabold tracking-wider text-white">PROTON</span>
            <p className="text-xs text-zinc-650 mt-1">&copy; {new Date().getFullYear()} PROTON. Built for expressive engineers.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#changelog" className="hover:text-white transition-colors">Changelog</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            {/* Globe Icon */}
            <a href="#language" className="hover:text-white transition-colors" title="Select Language">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
            {/* Mail Icon */}
            <a href="mailto:abdulgaffar7274@gmail.com" className="hover:text-white transition-colors" title="Contact Support">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
