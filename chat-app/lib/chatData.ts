import type { Chat, Message } from "../types/chat"

// Return empty data since we don't want dummy chats anymore
export async function getChatData() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const chats: Chat[] = []
  const messages: { [chatId: string]: Message[] } = {}

  return { chats, messages }
}
