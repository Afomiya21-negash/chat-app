import type { Metadata } from "next"
import LandingHero from "../components/LandingHero"
import AppShowcase from "../components/AppShowcase"
import Header from "../components/Header"

export const metadata: Metadata = {
  title: "ቡና ጠጡ - Welcome",
  description: "Welcome to ቡና ጠጡ. Connect with your friends and family through our modern chat application.",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#002F63] to-gray-900">
      <Header />
      <LandingHero />
      <AppShowcase />
    </div>
  )
}
