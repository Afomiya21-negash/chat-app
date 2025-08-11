"use client"

import type { Chat } from "../types/chat"
import { X, Search, MessageCircle, Users, Settings, Plus } from "lucide-react"

interface ChatSidebarProps {
  chats: Chat[]
  selectedChatId: string
  onSelectChat: (chatId: string) => void
  onClose: () => void
}

export default function ChatSidebar({ chats, selectedChatId, onSelectChat, onClose }: ChatSidebarProps) {
  return (
    <div className="h-full bg-[#002F63] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#002856] flex justify-between items-center">
        <h2 className="text-xl font-semibold">ቡና ጠጡ</h2>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-[#002856] rounded">
          <X size={20} />
        </button>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-[#002856] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#002856] transition-colors">
            <MessageCircle size={20} />
            <span>All Chats</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#002856] transition-colors">
            <Users size={20} />
            <span>Groups</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#002856] transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <button className="w-full flex items-center justify-center space-x-2 p-3 bg-white text-[#002F63] rounded-lg hover:bg-gray-100 transition-colors font-medium">
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat list - Empty for now */}
      <div className="flex-1 overflow-y-auto px-4">
        {chats.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id)
                onClose()
              }}
              className={`
                p-4 cursor-pointer hover:bg-[#002856] transition-colors rounded-lg mb-2
                ${selectedChatId === chat.id ? "bg-[#002856]" : ""}
              `}
            >
              {/* Chat item content would go here */}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#002856]">
        <div className="text-center text-xs text-gray-300">
          <p>ቡና ጠጡ v1.0</p>
        </div>
      </div>
    </div>
  )
}
