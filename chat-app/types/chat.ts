export interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}

export interface Message {
  id: string
  text: string
  sender: "user" | "other"
  timestamp: Date
  chatId: string
}
