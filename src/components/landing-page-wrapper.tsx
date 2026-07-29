"use client"

import dynamic from "next/dynamic"

// Dynamically load the client landing page component with SSR disabled.
// This client-side wrapper is required by Next.js to allow ssr: false.
const LandingPage = dynamic(() => import("./landing-page"), {
  ssr: false,
})

export default function LandingPageWrapper() {
  return <LandingPage />
}
