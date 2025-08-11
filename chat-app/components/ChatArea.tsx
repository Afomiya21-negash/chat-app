"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import Image from "next/image"
import type { Chat, Message } from "../types/chat"
import { Menu, Send, Paperclip, Smile, MessageCircle } from "lucide-react"

interface ChatAreaProps {
  selectedChat?: Chat
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: (message: string) => void
  onToggleSidebar: () => void
}

export default function ChatArea({
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onToggleSidebar,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSendMessage(newMessage)
  }

  // Show welcome screen when no chat is selected
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <h3 className="font-medium text-gray-900">ቡና ጠጡ</h3>
        </div>

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center max-w-md mx-auto px-6">
            {/* App Logo/Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#002F63] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">ቡና ጠጡ</h1>
              <p className="text-gray-600">Connect with your friends and family</p>
            </div>

            {/* Start Messaging Button */}
            <button
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#002F63] to-[#002856] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
              onClick={() => {
                // For now, this doesn't do anything as requested
                console.log("Start messaging clicked - not implemented yet")
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <MessageCircle size={24} className="group-hover:animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-lg">Start Messaging</span>
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Additional Info */}
            <div className="mt-8 space-y-4 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Ready to connect</span>
              </div>
              <p className="max-w-sm mx-auto leading-relaxed">
                Start meaningful conversations with your loved ones. Share moments, create memories, and stay connected.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={20} className="text-[#002F63]" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Instant Messages</h3>
                <p className="text-xs text-gray-500">Real-time messaging</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Always Online</h3>
                <p className="text-xs text-gray-500">Stay connected 24/7</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-4 h-4 border-2 border-purple-500 rounded border-dashed animate-spin"></div>
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Secure</h3>
                <p className="text-xs text-gray-500">Private & encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={20} />
        </button>

        <Image
          src={selectedChat.avatar || "/placeholder.svg"}
          alt={selectedChat.name}
          width={40}
          height={40}
          className="rounded-full"
        />

        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
          <p className="text-sm text-gray-500">{selectedChat.isOnline ? "Online" : "Last seen recently"}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`
                ${message.sender === "user" ? "chat-bubble-sent" : "chat-bubble-received"}
              `}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Smile size={18} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-[#002F63] text-white rounded-full hover:bg-[#002856] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
