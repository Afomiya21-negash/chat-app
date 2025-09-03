"use client"

import { X } from "lucide-react"
import axios from "axios"
import { useEffect, useState } from "react"

type ChatUser = { id: number; username: string }

interface ManageGroupMembersProps {
  token: string | null
  groupId: number
  currentMembers: ChatUser[]
  creatorId: number
  onMemberRemoved: () => void
  onClose: () => void
}

export default function RemoveGroupMembers({
  token,
  groupId,
  currentMembers,
  creatorId,
  onMemberRemoved,
  onClose,
}: ManageGroupMembersProps) {
  // Local state for members (so we can remove instantly)
  const [membersToDisplay, setMembersToDisplay] = useState<ChatUser[]>([])

  // ✅ Sync with parent when currentMembers changes
  useEffect(() => {
    setMembersToDisplay(currentMembers.filter((m) => m.id !== creatorId))
  }, [currentMembers, creatorId])

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

      // ✅ Update UI instantly
      setMembersToDisplay((prev) => prev.filter((m) => m.id !== userId))

      // ✅ Notify parent to reload chats
      onMemberRemoved()
    } catch (err: unknown) {
      let errorMessage = "Failed to remove member";
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        errorMessage = err.response.data.message as string;
      }
      alert(errorMessage)
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

        {membersToDisplay.length === 0 ? (
          <div className="text-gray-400 text-center py-6">No members left</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {membersToDisplay.map((m) => (
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
        )}
      </div>
    </div>
  )
}