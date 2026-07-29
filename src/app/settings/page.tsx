"use client"

import * as React from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { updateProfile } from "@/app/actions/user"

type TabType = "Profile" | "Plan & Billing" | "Preferences" | "Notifications"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = React.useState<TabType>("Profile")
  
  // Profile Form States
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [jobTitle, setJobTitle] = React.useState("")
  
  // UI states
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Initialize fields once user is loaded
  React.useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setEmail(user.primaryEmailAddress?.emailAddress || "")
      setJobTitle((user.unsafeMetadata?.jobTitle as string) || "")
    }
  }, [isLoaded, user])

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400" />
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading settings...</span>
        </div>
      </div>
    )
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setToast(null)
    
    try {
      await updateProfile({
        firstName,
        lastName,
        email,
        jobTitle,
      })
      
      // Reload Clerk user instance to refresh client-side data
      await user?.reload()
      
      setToast({
        message: "Profile updated successfully!",
        type: "success",
      })
    } catch (err: any) {
      console.error(err)
      setToast({
        message: err.message || "Failed to update profile. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    setToast(null)

    try {
      await user.setProfileImage({ file })
      await user.reload()
      setToast({
        message: "Profile photo updated successfully!",
        type: "success",
      })
    } catch (err: any) {
      console.error(err)
      setToast({
        message: err.message || "Failed to upload photo.",
        type: "error",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleAvatarRemove = async () => {
    if (!user) return
    setIsUploading(true)
    setToast(null)

    try {
      await user.setProfileImage({ file: null })
      await user.reload()
      setToast({
        message: "Profile photo removed.",
        type: "success",
      })
    } catch (err: any) {
      console.error(err)
      setToast({
        message: err.message || "Failed to remove photo.",
        type: "error",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const userImageUrl = user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  const userFullName = user?.fullName || `${firstName} ${lastName}`.trim() || "Alex Morgan"
  const userEmail = user?.primaryEmailAddress?.emailAddress || email || "alex.morgan@proton.dev"

  return (
    <div className="flex h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950/50 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-bottom-5 duration-300 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{toast.message}</span>
        </div>
      )}

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

          {/* New Board Action Button (redirects back to dashboard) */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>New Board</span>
          </Link>

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
              const isActive = item.href === "/settings"
              return (
                <Link
                  key={item.name}
                  href={item.href}
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

        {/* BOTTOM USER PROFILE BADGE */}
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 shadow-inner">
                <img src={userImageUrl} alt="User profile" className="h-full w-full object-cover" />
              </div>

              {/* Identity Details */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                  {userFullName}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                  {userEmail}
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
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto px-8 py-10 flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Manage your account settings and preferences.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-zinc-250/80 dark:border-zinc-850/80">
            {(["Profile", "Plan & Billing", "Preferences", "Notifications"] as TabType[]).map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-bold transition-all border-b-2 relative -bottom-[2px] cursor-pointer ${
                    isActive
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-extrabold"
                      : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* TAB PANELS */}
          <div className="mt-2">
            
            {/* PROFILE TAB */}
            {activeTab === "Profile" && (
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Profile Information</h3>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    Update your photo and personal details.
                  </p>
                </div>

                {/* Avatar Upload Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="h-20 w-20 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 shadow-inner relative group">
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    ) : null}
                    <img src={userImageUrl} alt="User Avatar" className="h-full w-full object-cover" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Upload New Photo
                      </button>
                      
                      {user?.hasImage && (
                        <button
                          onClick={handleAvatarRemove}
                          disabled={isUploading}
                          className="px-4 py-2 border border-zinc-200/80 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      JPG, GIF or PNG. Max size of 2MB.
                    </span>
                  </div>
                </div>

                {/* Profile Fields Form */}
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="firstName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        required
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-[#fafafa] dark:bg-zinc-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-50 disabled:opacity-65"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="lastName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Morgan"
                        required
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-[#fafafa] dark:bg-zinc-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-50 disabled:opacity-65"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex.morgan@proton.dev"
                        required
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-[#fafafa] dark:bg-zinc-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-50 disabled:opacity-65"
                      />
                    </div>

                    {/* Job Title */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="jobTitle" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Job Title
                      </label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Product Designer"
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-[#fafafa] dark:bg-zinc-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-50 disabled:opacity-65"
                      />
                    </div>
                  </div>

                  {/* Form Actions Footer */}
                  <div className="flex justify-end items-center gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (user) {
                          setFirstName(user.firstName || "")
                          setLastName(user.lastName || "")
                          setEmail(user.primaryEmailAddress?.emailAddress || "")
                          setJobTitle((user.unsafeMetadata?.jobTitle as string) || "")
                        }
                      }}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 border border-zinc-200/80 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PLAN & BILLING TAB */}
            {activeTab === "Plan & Billing" && (
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Subscription Plan</h3>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    View your current plan details and billing schedule.
                  </p>
                </div>

                {/* Plan Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/20 p-5 rounded-2xl flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">Current Plan</span>
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-tight">Active</span>
                      </div>
                      <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Pro Plan</h4>
                      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                        Unlimited boards, PDF exports, and priority cloud canvas support.
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link
                        href="/pricing"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Change Plan
                      </Link>
                      <button
                        onClick={() => setToast({ message: "Mock Card Update flow triggered.", type: "success" })}
                        className="px-4 py-2 border border-zinc-200/80 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  </div>

                  <div className="border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/20 p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Price</span>
                      <h4 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">$12<span className="text-sm font-bold text-zinc-450 dark:text-zinc-500 font-normal"> / mo</span></h4>
                    </div>

                    <div className="flex flex-col gap-1 mt-6">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-550 dark:text-zinc-400">
                        <span>Payment Method</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">Visa •••• 4242</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-550 dark:text-zinc-400">
                        <span>Billing Cycle</span>
                        <span className="text-zinc-900 dark:text-zinc-100">Monthly</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-550 dark:text-zinc-400">
                        <span>Next Invoice</span>
                        <span className="text-zinc-900 dark:text-zinc-100">Aug 29, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Invoice History */}
                <div className="flex flex-col gap-4 mt-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Invoice History</h4>
                  <div className="border border-zinc-200/80 dark:border-zinc-850 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/80 dark:border-zinc-850 text-xs font-bold text-zinc-500 dark:text-zinc-450 uppercase tracking-tight">
                          <th className="px-5 py-3">Invoice Date</th>
                          <th className="px-5 py-3">Plan</th>
                          <th className="px-5 py-3">Amount</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {[
                          { date: "Jul 29, 2026", desc: "Pro Plan - Monthly", amt: "$12.00" },
                          { date: "Jun 29, 2026", desc: "Pro Plan - Monthly", amt: "$12.00" },
                          { date: "May 29, 2026", desc: "Pro Plan - Monthly", amt: "$12.00" },
                        ].map((invoice) => (
                          <tr key={invoice.date} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-all">
                            <td className="px-5 py-3.5 font-mono">{invoice.date}</td>
                            <td className="px-5 py-3.5">{invoice.desc}</td>
                            <td className="px-5 py-3.5 font-mono font-bold">{invoice.amt}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                PAID
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "Preferences" && (
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">App Preferences</h3>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    Customize your display mode and editing workspace.
                  </p>
                </div>

                {/* Theme Selector */}
                <div className="flex flex-col gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">Interface Theme</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        name: "light",
                        label: "Light Mode",
                        icon: (
                          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ),
                        bg: "bg-white border-zinc-200 text-zinc-900"
                      },
                      {
                        name: "dark",
                        label: "Dark Mode",
                        icon: (
                          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ),
                        bg: "bg-zinc-950 border-zinc-800 text-zinc-100"
                      },
                      {
                        name: "system",
                        label: "System default",
                        icon: (
                          <svg className="w-5 h-5 text-zinc-550 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ),
                        bg: "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350"
                      }
                    ].map((opt) => {
                      const isSelected = theme === opt.name
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setTheme(opt.name)}
                          className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm ${
                            isSelected
                              ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20"
                              : "border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/10"
                          }`}
                        >
                          <div className={`p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-[#fafafa] dark:bg-zinc-900`}>
                            {opt.icon}
                          </div>
                          <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Language Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-755 dark:text-zinc-300">App Language</label>
                    <select className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-[#fafafa] dark:bg-zinc-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100">
                      <option>English (US)</option>
                      <option>Spanish (Español)</option>
                      <option>French (Français)</option>
                      <option>German (Deutsch)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-755 dark:text-zinc-300">Canvas Default Grid Mode</label>
                    <select className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-[#fafafa] dark:bg-zinc-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100">
                      <option>Dotted Grid (24px)</option>
                      <option>Solid Grid Lines</option>
                      <option>Blank Infinite Sheet</option>
                    </select>
                  </div>
                </div>

                {/* Editing Shortcuts */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">Workspace Settings</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { id: "shortcut-tooltips", title: "Show keyboard shortcut tooltips", desc: "Display shortcut hints when hovering over whiteboard toolbar options." },
                      { id: "snap-grid", title: "Snap elements to grid", desc: "Align shapes and lines automatically to the nearest grid nodes." },
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                        <div className="flex flex-col gap-0.5">
                          <label htmlFor={pref.id} className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">{pref.title}</label>
                          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">{pref.desc}</span>
                        </div>
                        <input
                          id={pref.id}
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-800 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "Notifications" && (
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Notification Settings</h3>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    Decide when you want to receive alerts and email summaries.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Email Digests Section */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">Email Notifications</h4>
                    <div className="flex flex-col gap-3">
                      {[
                        { title: "Comments on my boards", desc: "Receive an email when someone writes a sticky feedback note or replies to your board thread." },
                        { title: "Board sharing invitations", desc: "Notify me when teammates invite me to collaborate on their private drawing sheets." },
                        { title: "Weekly canvas updates digest", desc: "A periodic summary of changes and edits across your active team projects." },
                        { title: "Product news & tutorials", desc: "Tips, tricks, and new feature highlights for whiteboard editing." }
                      ].map((alert, idx) => (
                        <div key={idx} className="flex items-start justify-between p-4 rounded-xl border border-zinc-150/80 dark:border-zinc-850/50 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-all">
                          <div className="flex flex-col gap-0.5 pr-6">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{alert.title}</span>
                            <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-550 leading-normal">{alert.desc}</span>
                          </div>
                          
                          {/* Toggle switch */}
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input type="checkbox" defaultChecked={idx !== 3} className="sr-only peer" />
                            <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 shadow-inner" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Push Section */}
                  <div className="flex flex-col gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">Push Alerts</h4>
                    <div className="flex items-start justify-between p-4 rounded-xl border border-zinc-150/80 dark:border-zinc-850/50 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-all">
                      <div className="flex flex-col gap-0.5 pr-6">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Enable browser push notifications</span>
                        <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-550 leading-normal">Show real-time desk notifications when teammates are actively collaborating with you on a board.</span>
                      </div>
                      
                      {/* Toggle switch */}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 shadow-inner" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  )
}
