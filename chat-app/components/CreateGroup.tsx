
"use client"

import { useState } from "react"
import axios from "axios"
import { Plus, X } from "lucide-react"

type ChatUser = { id: number; username: string }
type Chat = {
  id: number
  type: "private" | "group"
  name?: string
  users: ChatUser[]
  messages?: unknown[]
}

interface CreateGroupProps {
  token: string | null
  me: ChatUser | null   // ✅ me is expected here
  onCreated: (chat: Chat) => void
}

export default function CreateGroup({ token, me, onCreated }: CreateGroupProps) {  // ✅ add `me`
  const [name, setName] = useState("")
  const [searchName, setSearchName] = useState("")
  const [searchResult, setSearchResult] = useState<ChatUser | null>(null)
  const [members, setMembers] = useState<ChatUser[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [creating, setCreating] = useState(false)

  const searchUser = async () => {
    if (!token || !searchName.trim()) return
    setLoadingSearch(true)
    try {
      const res = await axios.post<ChatUser>(
        "/api/users",
        { username: searchName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setSearchResult(res.data)
    } catch (e) {
      console.error(e)
      setSearchResult(null)
    } finally {
      setLoadingSearch(false)
    }
  }

  const addMember = (user: ChatUser) => {
    if (members.find((m) => m.id === user.id)) return
    setMembers((prev) => [...prev, user])
    setSearchResult(null)
    setSearchName("")
  }

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const create = async () => {
    if (!token || !me) return    // ✅ make sure me exists
    if (!name.trim()) {
      alert("Enter group name")
      return
    }
    if (members.length < 1) {
      alert("Add at least one member")
      return
    }

    setCreating(true)
    try {
      const memberIds = members.map((m) => m.id)
      const res = await axios.post<Chat>(
        "/api/groups",
        { name, memberIds, creatorId: me.id },   // ✅ now safe to use me.id
        { headers: { Authorization: `Bearer ${token}` } },
      )

      onCreated(res.data)
      setName("")
      setMembers([])
      setSearchName("")
      setSearchResult(null)
    } catch (e) {
      console.error("Failed to create group", e)
      alert("Failed to create group")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#002F63]"
      />

      <div className="space-y-2">
        <input
          placeholder="Search username to add"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#002F63]"
        />
        <button
          onClick={searchUser}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          disabled={loadingSearch}
        >
          {loadingSearch ? "Searching..." : "Search"}
        </button>

        {searchResult && (
          <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
            <span className="text-white">{searchResult.username}</span>
            <button
              onClick={() => addMember(searchResult)}
              className="px-3 py-1 bg-[#002F63] hover:bg-[#002856] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {members.length > 0 && (
        <div className="space-y-2">
          <div className="text-white font-medium">Members:</div>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                <span className="text-white">{m.username}</span>
                <button
                  onClick={() => removeMember(m.id)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={create}
        disabled={creating}
        className="w-full px-4 py-3 bg-[#002F63] hover:bg-[#002856] text-white rounded-lg transition-colors font-medium"
      >
        {creating ? "Creating..." : "Create Group"}
      </button>
    </div>
  )
}