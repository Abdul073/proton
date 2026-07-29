import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans dot-grid selection:bg-indigo-100 dark:selection:bg-indigo-950/50 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* Decorative Pencil Icon on Top Left */}
      <div className="absolute top-28 left-8 md:left-16 text-indigo-200 dark:text-indigo-950/30 pointer-events-none hidden md:block">
        <svg className="w-12 h-12 transform -rotate-12 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.188.188a1.5 1.5 0 11-2.122 2.122l-.188-.188m2.122-2.122A1.5 1.5 0 107.408 14l2.122 2.122zm0 0L19.5 5.5a1.5 1.5 0 112.12 2.12L11.65 18.242M3 21h3.5" />
        </svg>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl font-black tracking-wider text-indigo-600 dark:text-indigo-400">PROTON</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <a href="/features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border-b-2 border-indigo-600 pb-0.5">Features</a>
            <a href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-4 py-2 transition-colors cursor-pointer">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-semibold bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                  Start Drawing Free
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <a href="/dashboard" className="text-sm font-semibold bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                Go to Workspace
              </a>
              <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 shadow-inner">
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col items-center relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-[68px] font-black text-center tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.05] py-2">
            Sketch ideas together,<br />
            <span className="italic font-serif text-indigo-600 dark:text-indigo-400 font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-500 bg-clip-text text-transparent">in real time.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 text-center max-w-2xl leading-relaxed font-medium">
            The simplest way for teams to brainstorm, wireframe, and collaborate on a digital canvas that feels like paper.
          </p>

          <div className="mt-8">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="h-12 px-6 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/10 dark:shadow-none hover:shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm">
                  Start Drawing Free
                </button>
              </SignUpButton>
            </Show>
            
            <Show when="signed-in">
              <a href="/dashboard" className="h-12 px-6 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/10 dark:shadow-none hover:shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer text-sm">
                Go to Workspace
              </a>
            </Show>
          </div>
        </div>

        {/* Whiteboard Interactive Canvas Mockup */}
        <section className="w-full max-w-5xl mt-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200/80 dark:border-zinc-800 overflow-hidden relative">
          
          {/* Mock Browser Header */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            
            {/* Center URL bar */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-md px-4 py-1 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 max-w-sm w-full mx-auto justify-center select-none shadow-sm">
              <svg className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-mono tracking-tight text-zinc-400 dark:text-zinc-500">proton.app/workspace/collab-session</span>
            </div>
            
            {/* Right controls placeholder */}
            <div className="w-16 flex items-center justify-end gap-2 text-zinc-400 select-none">
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-medium">LIVE</span>
            </div>
          </div>

          {/* Canvas Draw Workspace */}
          <div className="h-[460px] relative overflow-hidden bg-[#fafafb] dark:bg-zinc-950/40 dot-grid select-none">
            
            {/* Drawing Canvas SVGs / Connective arrows */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 460" fill="none">
              {/* Connective arrow 1: Sticky to Blue block */}
              <path d="M 210 170 C 250 200, 240 220, 290 230" stroke="#a5b4fc" strokeWidth="2.5" strokeDasharray="6,6" markerEnd="url(#arrow-head)" />
              {/* Connective arrow 2: Blue block to Indigo block */}
              <path d="M 500 240 C 560 210, 580 180, 660 170" stroke="#a5b4fc" strokeWidth="2.5" strokeDasharray="6,6" markerEnd="url(#arrow-head)" />
              
              <defs>
                <marker id="arrow-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#a5b4fc" />
                </marker>
              </defs>
            </svg>

            {/* Left Toolbar */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 flex flex-col gap-1 z-25">
              <button className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer" title="Select pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.043 16.242L19.5 21M4.5 3v15.25l3.75-3.75 3 7.5 2.5-1-3-7.5h6.25L4.5 3z" />
                </svg>
              </button>
              <button className="p-2.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Freehand Draw">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-2.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Add Text">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
              <button className="p-2.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Sticky Note">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button className="p-2.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Shapes">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                </svg>
              </button>
              <button className="p-2.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Image Upload">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
              <button className="p-2.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Undo">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </div>

            {/* Element 1: Sticky Note */}
            <div className="absolute top-[60px] left-[70px] bg-amber-50/95 dark:bg-amber-950/90 border border-amber-200/90 dark:border-amber-900/50 w-48 p-4 rounded-lg shadow-md rotate-2 text-amber-900/95 dark:text-amber-200 font-sans z-10 transition-transform hover:scale-105 duration-350">
              <div className="font-extrabold text-[10px] uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80 mb-2 border-b border-amber-200 dark:border-amber-900/40 pb-1">⚡ Proton Canvas</div>
              <p className="text-xs leading-relaxed font-medium">
                1. Sign up using Clerk Auth<br />
                2. Automatically redirects back to home<br />
                3. Real-time multi-user sketching canvas!
              </p>
            </div>

            {/* Element 2: Interactive React Component Box */}
            <div className="absolute top-[200px] left-[260px] bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-950/60 w-[240px] p-4 rounded-xl shadow-lg -rotate-1 text-zinc-800 dark:text-zinc-200 z-10 transition-transform hover:scale-105 duration-350">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">Main Engine</span>
              </div>
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">React Drawing Engine</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed font-medium">
                Generates smooth, hand-drawn vector paths using customizable Bezier curve calculations.
              </p>
            </div>

            {/* Element 3: Database Session Card */}
            <div className="absolute top-[80px] right-[100px] bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/50 w-44 p-4 rounded-xl shadow-md rotate-1 text-zinc-800 dark:text-zinc-200 z-10 transition-transform hover:scale-105 duration-350">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h5 className="font-extrabold text-[11px] text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">Session Active</h5>
              </div>
              <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-semibold mb-3">3 members on board</div>
              <div className="flex items-center -space-x-1.5">
                <div className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-purple-500 text-white font-bold flex items-center justify-center text-[9px] shadow-sm">S</div>
                <div className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-emerald-500 text-white font-bold flex items-center justify-center text-[9px] shadow-sm">A</div>
                <div className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-orange-500 text-white font-bold flex items-center justify-center text-[9px] shadow-sm">D</div>
                <div className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold flex items-center justify-center text-[8px] shadow-sm">+9</div>
              </div>
            </div>

            {/* Multiplayer Cursor 1: Sarah */}
            <div className="absolute top-[135px] left-[320px] flex items-center gap-1.5 select-none z-20">
              <svg className="w-5 h-5 text-purple-500 filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 3v15.25l3.75-3.75 3 7.5 2.5-1-3-7.5h6.25L4.5 3z" />
              </svg>
              <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md leading-none">Sarah</span>
            </div>

            {/* Multiplayer Cursor 2: Alex */}
            <div className="absolute top-[280px] left-[170px] flex items-center gap-1.5 select-none z-20">
              <svg className="w-5 h-5 text-emerald-500 filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 3v15.25l3.75-3.75 3 7.5 2.5-1-3-7.5h6.25L4.5 3z" />
              </svg>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md leading-none">Alex</span>
            </div>

            {/* Multiplayer Cursor 3: David */}
            <div className="absolute top-[230px] right-[260px] flex items-center gap-1.5 select-none z-20">
              <svg className="w-5 h-5 text-orange-500 filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 3v15.25l3.75-3.75 3 7.5 2.5-1-3-7.5h6.25L4.5 3z" />
              </svg>
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md leading-none">David</span>
            </div>

            {/* Feedback Comment Bubble on Bottom Right */}
            <div className="absolute right-4 bottom-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl shadow-lg p-3 flex items-center gap-2.5 z-20 transition-transform hover:translate-y-[-2px] duration-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-xs font-black text-indigo-700 dark:text-indigo-300 shadow-inner">
                JD
              </div>
              <div className="text-left">
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-none">John Doe</div>
                <div className="text-xs text-zinc-800 dark:text-zinc-200 font-black mt-0.5">"Great flow!"</div>
              </div>
            </div>
          </div>
        </section>        {/* Feature Overview Section */}
        <section id="features" className="w-full mt-24 max-w-5xl relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-start bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Real-time collaboration</h3>
              <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Edit with your team simultaneously with zero lag. See every stroke, movement, and thought as it happens, no matter where you are in the world.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Hand-drawn aesthetic</h3>
              <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Beautifully imperfect sketches that keep focus on ideas, not pixels. Our engine translates your input into organic, expressive lines that invite creativity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-start bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Export anywhere</h3>
              <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Save your canvases as high-quality SVGs, PNGs, or share persistent links. Seamlessly move from a messy brainstorm to a polished presentation.
              </p>
            </div>
          </div>

          {/* Floating Outline Star Doodle */}
          <div className="absolute -right-8 bottom-[-40px] text-zinc-200 dark:text-zinc-800 pointer-events-none hidden lg:block">
            <svg className="w-10 h-10 opacity-70 transform rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.172-.378.71-.378.882 0l2.3 4.66 5.137.747c.417.06.584.576.282.876l-3.717 3.623.877 5.118c.071.417-.367.736-.74.54L12 16.59l-4.597 2.417c-.373.196-.811-.123-.74-.54l.877-5.118-3.717-3.623c-.302-.3-.135-.816.282-.876l5.137-.747 2.3-4.66z" />
            </svg>
          </div>
        </section>

        {/* Section Break / Headline */}
        <section className="w-full mt-36 max-w-5xl text-left">
          <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Precision meets play.</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">The tools you need to build the next big thing.</p>

          {/* Asymmetric Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            
            {/* Card 1: Infinite Canvas (spans 2 columns on desktop) */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 min-h-[250px]">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Infinite Canvas</h3>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-md">
                  Never run out of room for your biggest ideas. Zoom from bird's-eye view to pixel perfection in a snap.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                
                {/* Visual Avatar Group */}
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">A</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">B</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400 shadow-sm">C</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 shadow-sm">+12</div>
                </div>

                {/* Target/Zoom graphic */}
                <div className="text-zinc-350 dark:text-zinc-600">
                  <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="8" y="8" width="32" height="32" rx="4" strokeDasharray="4,4" />
                    <circle cx="24" cy="24" r="6" />
                    <path d="M24 8v6M24 34v6M8 24h6M34 24h6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Zero Latency (Small Card) */}
            <div className="bg-indigo-600 dark:bg-indigo-950/40 border border-indigo-700 dark:border-indigo-900/50 rounded-2xl p-8 flex flex-col justify-between text-white hover:shadow-lg transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-zinc-900/60 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white dark:text-zinc-100">Zero Latency</h3>
                <p className="mt-3 text-xs text-indigo-100 dark:text-zinc-400 leading-relaxed font-medium">
                  Optimized for fast-paced engineering teams who can't afford to wait.
                </p>
              </div>
            </div>

            {/* Card 3: Digital Stickies */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/40 dark:border-indigo-900/50 rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-200 tracking-tight">Digital Stickies</h3>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Capture fleeting thoughts and organize them with ease.
                </p>
              </div>
            </div>

            {/* Card 4: Smart Shapes */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow duration-200 gap-6">
              <div className="flex flex-col justify-between max-w-sm">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Smart Shapes</h3>
                  <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Draw a rough circle, and watch it snap into a perfect (but still hand-drawn) curve.
                  </p>
                </div>
              </div>
              
              {/* Hand-drawn pentagon visualization */}
              <div className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-w-[200px] h-[140px] md:h-auto">
                <div className="relative w-28 h-28 flex items-center justify-center text-indigo-600">
                  {/* Drawing Pentagon SVG */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    {/* Hand-drawn rough shape */}
                    <path d="M 50 12 L 88 40 L 73 85 L 27 85 L 12 40 Z" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Perfect snapped shape overlay */}
                    <path d="M 50 15 L 85 41 L 71 82 L 29 82 L 15 41 Z" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                    
                    {/* Tiny sketch circle node */}
                    <circle cx="50" cy="15" r="3" fill="#4f46e5" />
                    <circle cx="85" cy="41" r="3" fill="#4f46e5" />
                    <circle cx="71" cy="82" r="3" fill="#4f46e5" />
                    <circle cx="29" cy="82" r="3" fill="#4f46e5" />
                    <circle cx="15" cy="41" r="3" fill="#4f46e5" />
                  </svg>
                  <span className="absolute bottom-2 right-2 text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500">Snapping...</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Call to Action Banner */}
        <section id="pricing" className="w-full mt-36 max-w-5xl">
          <div className="bg-indigo-600 dark:bg-indigo-950/50 rounded-2xl px-8 py-16 text-center text-white relative overflow-hidden shadow-xl shadow-indigo-600/10 dark:shadow-none">
            {/* Background glowing circle decorative */}
            <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-indigo-500 rounded-full blur-[100px] pointer-events-none opacity-50" />
            <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-blue-500 rounded-full blur-[100px] pointer-events-none opacity-30" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight max-w-2xl text-white dark:text-zinc-100">
                Ready to unlock your team's creativity?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-indigo-100 dark:text-zinc-400 max-w-lg leading-relaxed font-medium">
                Join over 10,000+ expressive engineers and designers who build on PROTON every day.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                <Show when="signed-out">
                  <SignUpButton mode="modal">
                    <button className="h-12 px-8 rounded-lg font-semibold bg-white hover:bg-zinc-50 text-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white transition-all cursor-pointer text-sm shadow-sm">
                      Get Started for Free
                    </button>
                  </SignUpButton>
                </Show>
                
                <Show when="signed-in">
                  <a href="#workspace" className="h-12 px-8 rounded-lg font-semibold bg-white hover:bg-zinc-50 text-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white transition-all flex items-center justify-center cursor-pointer text-sm shadow-sm">
                    Go to Workspace
                  </a>
                </Show>

                <button className="h-12 px-8 rounded-lg font-semibold border border-indigo-400 dark:border-indigo-800 bg-transparent hover:bg-indigo-500 dark:hover:bg-indigo-900 text-white transition-colors cursor-pointer text-sm">
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-6 text-zinc-500 dark:text-zinc-400 text-sm mt-36 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-base font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">PROTON</span>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">&copy; {new Date().getFullYear()} PROTON. Built for expressive engineers.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold">
            <a href="#privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Terms of Service</a>
            <a href="#changelog" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Changelog</a>
            <a href="#contact" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500">
            {/* Globe Icon */}
            <a href="#language" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors" title="Select Language">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
            {/* Mail Icon */}
            <a href="mailto:support@proton.app" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors" title="Contact Support">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
