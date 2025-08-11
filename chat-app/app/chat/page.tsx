import type { Metadata } from "next"
import ChatInterface from "../../components/ChatInterface"

export const metadata: Metadata = {
  title: "Chat - ቡና ጠጡ",
  description: "Chat with your friends and family on ቡና ጠጡ.",
}

export default async function ChatPage() {
  // Empty initial data - no dummy chats
  const initialChatData = {
    chats: [],
    messages: {},
  }

  return (
    <div className="h-screen bg-gray-50">
      <ChatInterface initialData={initialChatData} />
    </div>
  )
}
