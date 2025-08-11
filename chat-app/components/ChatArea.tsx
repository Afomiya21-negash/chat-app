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

           
          </div>
        </div>
      </div>
    )
  }


}
