"use client"

import { useState } from "react"
import ChatSidebar from "./ChatSidebar"
import ChatArea from "./ChatArea"
import type { Chat, Message } from "../types/chat"

interface ChatInterfaceProps {
  initialData: {
    chats: Chat[]
    messages: { [chatId: string]: Message[] }
  }
}

export default function ChatInterface({ initialData }: ChatInterfaceProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>("")
  const [messages, setMessages] = useState(initialData.messages)
  const [newMessage, setNewMessage] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const sendMessage = (message: string) => {
    if (!message.trim() || !selectedChatId) return

    const newMsg: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
      chatId: selectedChatId,
    }

    setMessages((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg],
    }))

    setNewMessage("")

    // Simulate response after 1 second
    setTimeout(() => {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! This is a demo response.",
        sender: "other",
        timestamp: new Date(),
        chatId: selectedChatId,
      }

      setMessages((prev) => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), responseMsg],
      }))
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-80 lg:w-80 h-full
      `}
      >
        <ChatSidebar
          chats={initialData.chats}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          selectedChat={initialData.chats.find((chat) => chat.id === selectedChatId)}
          messages={messages[selectedChatId] || []}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={sendMessage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  )
}
