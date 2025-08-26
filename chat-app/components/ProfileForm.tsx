"use client"

import { useState } from "react"

export default function ProfileForm() {
  const [username, setUsername] = useState("YourUsername")
  const [email, setEmail] = useState("you@example.com")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saved:", { username, email })
    alert("Profile updated successfully!")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-4"
    >
      <div>
        <label className="block text-gray-700 font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition"
      >
        Save Changes
      </button>
    </form>
  )
}
