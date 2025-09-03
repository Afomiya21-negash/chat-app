"use client"

import { useState } from "react"
import axios from "axios"
import { Plus, X } from "lucide-react"

type ChatUser = { id: number; username: string }

interface AddGroupMemberProps {
  token: string | null
  groupId: number
  currentMembers: ChatUser[]
  onMemberAdded: () => void
  onClose: () => void
}

export default function AddGroupMember({ token, groupId, currentMembers, onMemberAdded, onClose }: AddGroupMemberProps) {
  const [searchName, setSearchName] = useState("")
  const [searchResult, setSearchResult] = useState<ChatUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchUser = async () => {
    if (!token || !searchName.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await axios.post<ChatUser>(
        "/api/users",
        { username: searchName },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      
      if (currentMembers.some(m => m.id === res.data.id)) {
        setError("User is already in the group")
        setSearchResult(null)
      } else {
        setSearchResult(res.data)
      }
    } catch (e) {
      setError("User not found")
      setSearchResult(null)
    } finally {
      setLoading(false)
    }
  }

 const addMember = async (user: ChatUser) => {
  if (!token) return
  setLoading(true)
  try {
    await axios.put(
      "/api/groups/add",
      { chatId: groupId, userId: user.id }, // 👈 backend expects both
      { headers: { Authorization: `Bearer ${token}` } }
    )
    onMemberAdded()
    setSearchName("")
    setSearchResult(null)
    alert('Member added successfully!');
  } catch (e: unknown) {
   let errorMessage = "Failed to add member";
   if (e && typeof e === 'object' && 'response' in e && e.response && typeof e.response === 'object' && 'data' in e.response && e.response.data && typeof e.response.data === 'object') {
     const data = e.response.data as Record<string, unknown>;
     errorMessage = (data.message as string) || (data.error as string) || errorMessage;
   }
   alert(errorMessage)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add Group Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <input
              placeholder="Search username to add"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUser()}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#002F63]"
            />
            <button
              onClick={searchUser}
              disabled={loading || !searchName.trim()}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {searchResult && (
              <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                <span className="text-white">{searchResult.username}</span>
                <button
                  onClick={() => addMember(searchResult)}
                  className="p-1.5 bg-[#002F63] hover:bg-[#002856] text-white rounded-full transition-colors"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
