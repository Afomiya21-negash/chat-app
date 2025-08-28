"use client"
import Link from "next/link"
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react"
import axios from "axios"
import { Users, MessageCircle, Send, X, Menu, User, LogOut, Search, MoreVertical } from "lucide-react"
import CreateGroup from "./CreateGroup"
import AddGroupMember from "./AddGroupMember"

type ChatUser = { id: number; username: string }
type Message = {
  id: number
  chatId: number
  senderId: number
  sender?: ChatUser
  senderName?: string
  content: string
  createdAt?: string
  ts?: string
}
type Chat = {
  id: number
  type: "private" | "group"
  name?: string
  users: ChatUser[]
  messages?: Message[]
}

export default function ChatPage() {
  const [me, setMe] = useState<ChatUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [showSidebarMenu, setShowSidebarMenu] = useState(false)
  const [activeSection, setActiveSection] = useState<"chats" | "groups">("chats")
  const [searchQuery, setSearchQuery] = useState("")
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
 const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [addMemberGroup, setAddMemberGroup] = useState<Chat | null>(null)
  const privateChats = chats.filter((chat) => chat.type === "private")
  const groupChats = chats.filter((chat) => chat.type === "group")
  const currentChats = activeSection === "chats" ? privateChats : groupChats

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editUsername, setEditUsername] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [profileEmail, setProfileEmail] = useState("")

  const filteredChats = currentChats.filter((chat) => {
    if (!searchQuery.trim()) return true
    const chatName =
      chat.type === "group"
        ? chat.name?.toLowerCase()
        : chat.users.find((u) => u.id !== me?.id)?.username?.toLowerCase()
    return chatName?.includes(searchQuery.toLowerCase())
  })

  useEffect(() => {
    const t = localStorage.getItem("token")
    const u = localStorage.getItem("user")

    if (!t || !u) {
      window.location.href = "/login"
      return
    }

    setToken(t)
    setMe(JSON.parse(u))
    loadChats(t)
  }, [])

  async function loadChats(token: string) {
    try {
      const res = await axios.get<Chat[]>("/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setChats(res.data)
    } catch (e: any) {
      console.error("Failed to load chats:", e)
      if (e.response?.status === 401) {
        console.log("Token expired or invalid, redirecting to login...")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }
    }
  }

  async function loadMessages(chatId: number) {
    if (!token) return
    try {
      const m = await axios.get<Message[]>(`/api/chats/messages?chatId=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(m.data)
      setTimeout(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
      }, 50)
    } catch (e: any) {
      console.error("Failed to load messages:", e)
      if (e.response?.status === 401) {
        console.log("Token expired or invalid, redirecting to login...")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }
    }
  }

  async function send() {
    if (!activeChat || !text.trim() || !token) return
    try {
      await axios.post(
        "/api/chats/messages",
        { chatId: activeChat.id, content: text },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setText("")
      await loadMessages(activeChat.id)
      await loadChats(token)
    } catch (e: any) {
      console.error("Failed to send message:", e)
      if (e.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  const handleNewGroup = () => {
    setShowSidebarMenu(false)
    setShowGroupModal(true)
  }

  // Profile modal handlers
  const openProfileModal = async () => {
    setShowSidebarMenu(false)
    setShowProfileModal(true)
    setIsEditingProfile(false)

    if (!token) return
    try {
      const res = await axios.get<{ id: number; username: string; email: string }>("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEditUsername(res.data.username)
      setEditEmail(res.data.email)
      setProfileEmail(res.data.email)
    } catch (e: any) {
      console.error("Failed to load profile:", e)
      if (e.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }
    }
  }

  const handleEditProfile = () => setIsEditingProfile(true)
  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditUsername(me?.username || "")
    setEditEmail(profileEmail)
  }
  const handleSaveProfile = () => {
    // No update API yet; just update local UI state
    if (me) setMe({ ...me, username: editUsername })
    setProfileEmail(editEmail)
    setIsEditingProfile(false)
    setShowProfileModal(false)
  }

  const onTextChange = (e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)
  const onTextKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send()
  }

  async function searchUsers(query: string) {
    if (!token || !query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await axios.post<ChatUser>(
        "/api/users",
        { username: query },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const user = res.data
      const existingUserIds = new Set([me?.id, ...chats.flatMap((chat) => chat.users.map((u) => u.id))])

      if (existingUserIds.has(user.id)) {
        setSearchResults([])
      } else {
        setSearchResults([user])
      }
    } catch (e: any) {
      console.error("Failed to search users:", e)
      if (e.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  async function startChat(user: ChatUser) {
    if (!token) return
    try {
      const res = await axios.post<Chat>(
        "/api/chats",
        { otherUserId: user.id },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setActiveChat(res.data)
      await loadMessages(res.data.id)
      await loadChats(token)
      setSearchQuery("")
      setSearchResults([])
    } catch (e: any) {
      console.error("Failed to start chat:", e)
      if (e.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && activeSection === "chats") {
        searchUsers(searchQuery)
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeSection, token])
 useEffect(() => {
  const interval = setInterval(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, 2000); // every 2 seconds

  return () => clearInterval(interval);
}, [activeChat]);
  return (
    <div className="min-h-screen bg-black relative">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowSidebarMenu(!showSidebarMenu)}
          className="p-3 bg-[#002F63] hover:bg-[#002856] rounded-lg transition-colors shadow-lg"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        {showSidebarMenu && (
          <div className="absolute top-16 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[280px]">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">You</div>
                  <div className="text-sm text-gray-600">{me?.username}</div>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={openProfileModal}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
              >
                <User className="w-5 h-5 mr-3 text-gray-500" />
                My Profile
              </button>

              <button
                onClick={handleNewGroup}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
              >
                <Users className="w-5 h-5 mr-3 text-gray-500" />
                New Group
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-1 h-screen">
        <div className="col-span-4 bg-gray-900 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700 pt-20">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveSection("chats")}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeSection === "chats"
                    ? "bg-[#002F63] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chats
              </button>
              <button
                onClick={() => setActiveSection("groups")}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeSection === "groups"
                    ? "bg-[#002F63] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Groups
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder={`Search ${activeSection}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#002856] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div className="overflow-auto h-[calc(100vh-180px)]">
            {searchQuery.trim() && activeSection === "chats" && (searchResults.length > 0 || isSearching) ? (
              <div className="space-y-1">
                {isSearching && (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin w-6 h-6 border-2 border-[#002F63] border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching users...
                  </div>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => startChat(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#002F63] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-xs text-gray-400">Click to start chat</div>
                      </div>
                    </div>
                  </div>
                ))}
                {!isSearching && searchResults.length === 0 && (
                  <div className="p-4 text-center text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {activeSection === "chats" ? (
                  <>
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No chats yet</p>
                    <p className="text-sm">Start a conversation!</p>
                  </>
                ) : (
                  <>
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No groups yet</p>
                    <p className="text-sm">Create a group!</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${
                      activeChat?.id === c.id ? "bg-gray-800" : ""
                    }`}
                    onClick={async () => {
                      setActiveChat(c)
                      await loadMessages(c.id)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-[#002F63] rounded-full flex items-center justify-center">
                          {c.type === "group" ? (
                            <Users className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {c.type === "group" ? c.name : c.users.find((u) => u.id !== me?.id)?.username}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {c.messages?.length ? c.messages[0].content : "No messages"}
                          </div>
                        </div>
                      </div>
                     {c.type === "group" ? (
                        <div className="relative group">
                          <button
                            className="p-1 text-gray-400 hover:text-white focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              const menu = document.getElementById(`group-menu-${c.id}`)
                              // Close all other menus first
                              document.querySelectorAll('[id^="group-menu-"]').forEach((m) => {
                                if (m.id !== `group-menu-${c.id}`) {
                                  m.classList.add("hidden")
                                }
                              })
                              // Toggle current menu
                              menu?.classList.toggle("hidden")
                            }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <div
                            id={`group-menu-${c.id}`}
                            className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                          <button
  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
  onClick={(e) => {
    e.stopPropagation()

    setAddMemberGroup(c)          // ✅ store the group being modified
    setShowAddMemberModal(true)   // ✅ then open modal

    document.getElementById(`group-menu-${c.id}`)?.classList.add("hidden")
  }}
>
  Add new member
</button>

                               <button
  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
  onClick={async (e) => {
    e.stopPropagation()

    if (!token) return

    if (confirm("Are you sure you want to leave this group?")) {
      try {
        const res = await axios.put(
          "/api/groups/leave",
          { chatId: c.id }, // ✅ only send chatId, backend extracts user from JWT
          { headers: { Authorization: `Bearer ${token}` } }
        )

        alert("You have left the group")

        // Refresh chats after leaving
        await loadChats(token)

        if (activeChat?.id === c.id) {
          setActiveChat(null) // deselect if leaving active group
          setMessages([])
        }
      } catch (err: any) {
        console.error("Failed to leave group:", err)
        alert(err.response?.data?.error || "Error leaving group")
      }
    }

    document.getElementById(`group-menu-${c.id}`)?.classList.add("hidden")
  }}
>
  Leave group
</button>

                    <button
  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
  onClick={async (e) => {
    e.stopPropagation();

    if (
      confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      try {
        const res = await fetch("/api/groups/delete", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // assuming you store JWT here
          },
          body: JSON.stringify({ chatId: c.id }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to delete group");
          return;
        }

        alert("Group deleted successfully ✅");
        // Optional: Refresh group list after deletion
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Something went wrong while deleting the group");
      }
    }

    document
      .getElementById(`group-menu-${c.id}`)
      ?.classList.add("hidden");
  }}
>
  Delete group
</button>

                          </div>
                        </div>
                      ) : (
                        <div className="w-2 h-2 bg-[#002F63] rounded-full ml-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-8 flex flex-col bg-black">
          <div className="p-4 border-b border-gray-700 bg-gray-900">
            <div className="font-semibold text-white">
              {activeChat
                ? activeChat.type === "group"
                  ? activeChat.name
                  : activeChat.users.find((u) => u.id !== me?.id)?.username
                : "Select a chat"}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto" ref={messagesRef}>
            {!activeChat ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to ቡና ጠጡ</h3>
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === me?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md ${m.senderId === me?.id ? "order-2" : "order-1"}`}>
                      <div className="text-xs text-gray-400 mb-1">
                        <strong>{m.sender?.username || m.senderName}</strong> •{" "}
                        {new Date(m.createdAt || m.ts || "").toLocaleString()}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          m.senderId === me?.id ? "bg-[#002F63] text-white" : "bg-gray-800 text-white"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeChat && (
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={onTextChange}
                  onKeyDown={onTextKeyDown}
                  className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#002F63]"
                  placeholder="Type a message..."
                />
                <button
                  onClick={send}
                  className="bg-[#002F63] hover:bg-[#002856] text-white px-6 py-3 rounded-lg transition-colors flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Create Group</h3>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <CreateGroup
  token={token}
  me={me}   //  send the logged-in user
  onCreated={async (chat) => {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)])
    setActiveChat(chat)
    await loadMessages(chat.id)
    setShowGroupModal(false)
    setActiveSection("groups")
  }}
/>

          </div>
        </div>
      )}
       {showAddMemberModal && addMemberGroup && (
        <AddGroupMember
          token={token}
          groupId={addMemberGroup.id}
          currentMembers={addMemberGroup.users}
          onMemberAdded={async () => {
            await loadChats(token!)
            setShowAddMemberModal(false)
            setAddMemberGroup(null)
          }}
          onClose={() => {
            setShowAddMemberModal(false)
            setAddMemberGroup(null)
          }}
        />
      )}
     {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-white">My Profile</h3>
              <div className="flex items-center space-x-2">
                {!isEditingProfile ? (
                  <button
                    onClick={handleEditProfile}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    setShowProfileModal(false)
                    setIsEditingProfile(false)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{me?.username}</h4>
                  <p className="text-sm text-blue-500">online</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Username"
                      />
                    ) : (
                      <div>
                        <p className="text-blue-500">@{me?.username}</p>
                        <p className="text-sm text-gray-500">Username</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Email"
                      />
                    ) : (
                      <div>
                        <p className="text-blue-500">{profileEmail}</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
