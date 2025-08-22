import type { Metadata } from "next"
import SignupForm from "../../components/SignupForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign Up - ቡና ጠጡ",
  description: "Create your ቡና ጠጡ account and start connecting with friends and family.",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#002F63] to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ቡና ጠጡ</h1>

        </div>

        <SignupForm />

       
      </div>
    </div>
  )
}
