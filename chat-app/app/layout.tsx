import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ቡና ጠጡ - Connect with Friends and Family",
  description: "A modern chat application to connect with your friends and family. Built with Next.js and React.",
  keywords: ["chat", "messaging", "communication", "friends", "family"],
  authors: [{ name: "ቡና ጠጡ Team" }],
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
