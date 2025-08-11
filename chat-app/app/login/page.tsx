import type { Metadata } from "next"
import LoginForm from "../../components/LoginForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Login - ቡና ጠጡ",
  description: "Login to your ቡና ጠጡ account to start chatting with friends and family.",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#002F63] to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ቡና ጠጡ</h1>
          <p className="text-gray-600">Welcome back! Please login to your account.</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#002F63] hover:text-[#002856] font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
