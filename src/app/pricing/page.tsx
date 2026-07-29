"use client"

import * as React from "react"
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

export default function PricingPage() {
  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  const faqs = [
    {
      q: "Can I switch plans anytime?",
      a: "Yes, you can upgrade or downgrade your plan at any moment. Your billing will be adjusted pro-rata.",
    },
    {
      q: "Is there an education discount?",
      a: "We offer free Pro accounts for students and non-profit educators. Reach out to our support team.",
    },
    {
      q: "What happens if I cancel?",
      a: "Your boards will remain safe. You'll simply revert to the Free plan limits (3 active boards).",
    },
  ]

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans dot-grid selection:bg-indigo-100 dark:selection:bg-indigo-950/50 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl font-black tracking-wider text-indigo-600 dark:text-indigo-400">PROTON</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-550 dark:text-zinc-400">
            <Link href="/#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</Link>
            <Link href="/pricing" className="text-indigo-600 dark:text-indigo-400 font-bold transition-colors border-b-2 border-indigo-650 pb-0.5">Pricing</Link>
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
              <Link href="/dashboard" className="text-sm font-semibold bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                Go to Workspace
              </Link>
              <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 shadow-inner">
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center relative z-10 gap-20">
        
        {/* Page Title */}
        <div className="flex flex-col items-center max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Simple plans for <span className="relative inline-block text-indigo-600 dark:text-indigo-400">
              infinite ideas
              <svg className="absolute -bottom-2 left-0 w-full h-1.5 text-indigo-400/80" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed font-semibold">
            Whether you're a solo tinkerer or a high-performance engineering squad, we have the right canvas for your team.
          </p>
        </div>

        {/* PRICING CARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
          
          {/* FREE PLAN */}
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Free</h3>
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Perfect for exploring your first ideas.</p>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">$0</span>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">/mo</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

              {/* Features List */}
              <ul className="flex flex-col gap-3.5 text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>3 Active Boards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Real-time Collaboration</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 dark:text-zinc-600 line-through">
                  <svg className="w-4.5 h-4.5 text-zinc-300 dark:text-zinc-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Vector Export</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Basic Scribble Tools</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Public Board Sharing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/dashboard"
                className="block text-center py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-55/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* PRO PLAN (HIGHLIGHTED) */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-600 dark:border-indigo-500 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-indigo-600/5 dark:shadow-none relative backdrop-blur-md scale-[1.02] md:translate-y-[-4px]">
            {/* MOST POPULAR BADGE */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-455">Pro</h3>
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">For creators who need advanced capability.</p>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">$12</span>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">/mo</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

              {/* Features List */}
              <ul className="flex flex-col gap-3.5 text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Unlimited Boards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Full Version History</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>SVG/PDF/PNG Exports</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Advanced Shapes & Connectors</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Private Boards</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/settings?tab=Plan%20%26%20Billing"
                className="block text-center py-3 bg-indigo-600 hover:bg-indigo-755 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99]"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>

          {/* TEAM PLAN */}
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Team</h3>
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Collaborative features for large organization scaling.</p>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">$30</span>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">/user/mo</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

              {/* Features List */}
              <ul className="flex flex-col gap-3.5 text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                <li className="flex items-center gap-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20M3 11.627a1.018 1.018 0 01.077-1.302l1.3-1.3a1.018 1.018 0 011.302-.077 11.393 11.393 0 0011.302 0 1.018 1.018 0 011.302.077l1.3 1.3a1.018 1.018 0 01.077 1.302c-1.895 2.185-3.322 4.793-4.089 7.746M12 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  </svg>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>SSO & SAML Login</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Shared Component Library</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Advanced Permissions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Consolidated Billing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Custom Board Templates</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href="mailto:sales@proton.dev?subject=Team%20Inquiry%20from%20Proton"
                className="block text-center py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-55/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
              >
                Contact Sales
              </a>
            </div>
          </div>

        </section>

        {/* MIDDLE SHOWCASE BANNER */}
        <section className="w-full bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-6 max-w-md">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
              Unleash the full power of visual engineering.
            </h2>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">
              From sketching rough data flows to documenting complex distributed systems, PROTON provides the expressive tools you need to communicate clearly.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { label: "Sketch", desc: "Hand-drawn feel" },
                { label: "Sync", desc: "Real-time updates" },
                { label: "Scale", desc: "Team libraries" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banner Diagram Mockup (SVG / CSS) */}
          <div className="w-full md:w-96 h-60 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-md p-5 flex flex-col gap-4 overflow-hidden relative select-none">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Collaborative diagramming</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[8px] font-extrabold text-indigo-600">A</div>
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[8px] font-extrabold text-emerald-600">B</div>
              </div>
            </div>

            {/* Diagram simulation */}
            <div className="flex-1 flex items-center justify-center relative">
              <svg className="w-full h-full text-indigo-300 dark:text-indigo-650" viewBox="0 0 200 120" fill="none">
                {/* Node 1 */}
                <rect x="15" y="35" width="40" height="25" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.2" />
                <text x="35" y="50" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">Client</text>
                
                {/* Connection line */}
                <path d="M55 47 L95 47" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
                <polygon points="95,47 91,45 91,49" fill="currentColor" />

                {/* Node 2 */}
                <rect x="95" y="25" width="50" height="45" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" />
                <text x="120" y="42" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">GraphQL API</text>
                <line x1="100" y1="50" x2="140" y2="50" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
                <text x="120" y="58" fontSize="4.5" textAnchor="middle" fill="currentColor" fillOpacity="0.8">Express Node</text>

                {/* Connection line 2 */}
                <path d="M120 70 L120 90" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
                
                {/* Node 3 */}
                <rect x="95" y="90" width="50" height="20" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.2" />
                <text x="120" y="102" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">PostgreSQL</text>
              </svg>

              {/* Cursor badges */}
              <div className="absolute top-10 left-12 flex flex-col gap-1 items-start">
                <svg className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500 stroke-white stroke-[1px]" viewBox="0 0 24 24">
                  <path d="M4 4l11.733 11.733H8.267l-4.267 4.267V4z" />
                </svg>
                <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold shadow-md">Alex</span>
              </div>

              <div className="absolute bottom-6 right-16 flex flex-col gap-1 items-start">
                <svg className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500 stroke-white stroke-[1px] transform rotate-[105deg]" viewBox="0 0 24 24">
                  <path d="M4 4l11.733 11.733H8.267l-4.267 4.267V4z" />
                </svg>
                <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold shadow-md">Sarah</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs SECTION */}
        <section className="w-full flex flex-col gap-6 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 text-center">Commonly asked</h2>
          
          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="border border-zinc-200/80 dark:border-zinc-805 bg-white dark:bg-zinc-900/30 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left font-bold text-sm text-zinc-850 dark:text-zinc-150 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? "transform rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs font-semibold text-zinc-500 dark:text-zinc-450 leading-relaxed border-t border-zinc-100 dark:border-zinc-850 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-900/20 border-t border-zinc-200/50 dark:border-zinc-800/50 py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="text-sm font-black tracking-wider text-indigo-600 dark:text-indigo-400">PROTON</span>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              © 2026 PROTON. Built for expressive engineers.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Changelog</a>
            <a href="mailto:support@proton.dev" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
