import Link from "next/link"

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-white text-2xl font-bold"><img src="/coffee cup.jpg" alt="Logo" className="w-10 h-10 inline-block boarder-2 border-white rounded-full mr-2"/>ቡና ጠጡ</div>

        <div className="flex gap-4">
          <Link href="/login" className="btn-secondary">
            Login
          </Link>
          <Link href="/signup" className="btn-primary">
            Create Account
          </Link>
        </div>
      </div>
    </header>
  )
}
