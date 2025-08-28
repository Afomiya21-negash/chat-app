"use client"

import { X } from "lucide-react"
import axios from "axios"

type ChatUser = { id: number; username: string }

interface ManageGroupMembersProps {
  token: string | null
  groupId: number
  currentMembers: ChatUser[]
  onMemberRemoved: () => void
  onClose: () => void
}

export default function RemoveGroupMembers({
  token,
  groupId,
  currentMembers,
  onMemberRemoved,
  onClose,
}: ManageGroupMembersProps) {
  const removeMember = async (userId: number) => {
    if (!token) return
    if (!confirm("Are you sure you want to remove this member?")) return
    try {
      await axios.put(
        "/api/groups/remove",
        { chatId: groupId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Member removed ✅")
      onMemberRemoved()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove member")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Group Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {currentMembers.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
            >
              <span className="text-white">{m.username}</span>
              <button
                onClick={() => removeMember(m.id)}
                className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
