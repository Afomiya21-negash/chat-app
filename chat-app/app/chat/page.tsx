import type { Metadata } from "next"
import ChatPage from "../../components/ChatPage"

export const metadata: Metadata = {
  title: "Chat - ቡና ጠጡ",
  description: "Chat with your friends and family on ቡና ጠጡ.",
}

export default async function Chat() {
  return <ChatPage />
}
