import type { Metadata } from "next"
import LandingPageWrapper from "@/components/landing-page-wrapper"

export const metadata: Metadata = {
  title: "PROTON - Draw it before you explain it",
  description: "A shared canvas where every line looks hand-drawn, and your team sees each other's cursors moving in real time. No slides, no screen share, just draw.",
}

export default function Home() {
  return <LandingPageWrapper />
}
