"use client"
import Link from "next/link"
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react"
import axios from "axios"
import { Users, MessageCircle, Send, X, Menu, User, LogOut, Search, MoreVertical } from "lucide-react"
import CreateGroup from "./CreateGroup"
import AddGroupMember from "./AddGroupMember"
import RemoveMembersModal from "./RemoveGroupMembers"

type ChatUser = { id: number; username: string }
type UserType = { id: number; username: string } // Define a type for user info

type Message = {
    id: number;
    chatId: number;
    senderId: number;
    sender?: UserType;
    senderName?: string;
    content?: string | null;
    type: 'text' | 'image' | 'pdf' | 'file';
    fileName?: string | null;
    createdAt?: string;
    ts?: string;
};
type Chat = {
  id: number
  type: "private" | "group"
  name?: string
  users: ChatUser[]
  messages?: Message[]
  creatorId?: number  
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
   const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [removeMemberGroup, setRemoveMemberGroup] = useState<Chat | null>(null)
  const [file, setFile] = useState<File | null>(null);
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
        const t = localStorage.getItem('token');
        const u = localStorage.getItem('user');

        if (!t || !u) {
            window.location.href = '/login';
            return;
        }

        setToken(t);
        setMe(JSON.parse(u));
        loadChats(t);
    }, []);

   useEffect(() => {
        if (!activeChat || !token) {
            return;
        }

        const intervalId = setInterval(() => {
            loadMessages(activeChat.id);
        }, 3000); // Polls every 3 seconds

        // Cleanup function to clear the interval when the component unmounts
        // or when activeChat or token changes.
        return () => clearInterval(intervalId);
    }, [activeChat, token]);

  async function loadChats(token: string) {
        try {
            const res = await axios.get<Chat[]>('/api/chats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChats(res.data);
        } catch (e) {
            console.error(e);
        }
    }

  
    async function loadMessages(chatId: number) {
        if (!token) return;
        try {
            const m = await axios.get<Message[]>(`/api/chats/messages?chatId=${chatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(m.data);
            setTimeout(() => {
                messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
            }, 50);
        } catch (e) {
            console.error(e);
        }
    }

    async function downloadFile(messageId: number, fileName: string | null) {
        if (!token) return;
        try {
            const response = await fetch(`/api/chats/messages/download?messageId=${messageId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName || 'download';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Download failed:', response.statusText);
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    }

    async function send() {
        if (!activeChat || !token) return;
        if (text.trim() === '' && !file) return;

        try {
            const formData = new FormData();
            formData.append('chatId', String(activeChat.id));

            if (file) {
                formData.append('file', file);
                const fileType = file.type.split('/')[0];
                if (fileType === 'image') {
                    formData.append('type', 'image');
                } else if (file.type === 'application/pdf') {
                    formData.append('type', 'pdf');
                } else {
                    formData.append('type', 'file');
                }
            } else {
                formData.append('content', text);
                formData.append('type', 'text');
            }

            await axios.post(
                '/api/chats/messages',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setText('');
            setFile(null);
            // After sending, manually refresh messages to see the new one immediately
            await loadMessages(activeChat.id);
            await loadChats(token);
        } catch (e) {
            console.error(e);
        }
    }

   
    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setText('');
        }
    };

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
 const handleSaveProfile = async () => {
    if (!token) return
    try {
      await axios.put(
        "/api/users/update",
        { username: editUsername, email: editEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Profile updated successfully!")
      setProfileEmail(editEmail)
      setIsEditingProfile(false)
      setShowProfileModal(false)
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update profile")
    }
  }
  const onTextChange = (e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)
  const onTextKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send()
  }
  const handleDeleteAccount = async () => {
    if (!token) return
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }
    try {
      await axios.delete(
        "/api/users/update",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Account deleted successfully!")
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete account")
    }
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
  {/* Add member (always visible) */}
  <button
    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
    onClick={(e) => {
      e.stopPropagation()
      setAddMemberGroup(c)
      setShowAddMemberModal(true)
      document.getElementById(`group-menu-${c.id}`)?.classList.add("hidden")
    }}
  >
    Add new member
  </button>

  {/* If creator → Delete + Remove buttons */}
  {c.creatorId === me?.id ? (
    <>
      <button
        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
        onClick={async (e) => {
          e.stopPropagation()
          if (confirm("Delete this group permanently?")) {
            try {
              const res = await fetch("/api/groups/delete", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chatId: c.id }),
              })
              if (!res.ok) {
                alert("Failed to delete group")
                return
              }
              alert("Group deleted ✅")
              await loadChats(token!)
              if (activeChat?.id === c.id) {
                setActiveChat(null)
                setMessages([])
              }
            } catch (err) {
              console.error(err)
              alert("Error deleting group")
            }
          }
          document.getElementById(`group-menu-${c.id}`)?.classList.add("hidden")
        }}
      >
        Delete group
      </button>
  <>
     <button
  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
  onClick={(e) => {
    e.stopPropagation()
    setRemoveMemberGroup(c)   // store the clicked group
    setShowRemoveModal(true)  // open modal
    document.getElementById(`group-menu-${c.id}`)?.classList.add("hidden")
  }}
>
  Remove members
</button>


      
    </>
      
    </>
  ) : (
    // Else → just Leave button
    <button
      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
      onClick={async (e) => {
        e.stopPropagation()
        if (confirm("Leave this group?")) {
          try {
            await axios.put(
              "/api/groups/leave",
              { chatId: c.id },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            await loadChats(token!)
            if (activeChat?.id === c.id) {
              setActiveChat(null)
              setMessages([])
            }
          } catch (err) {
            console.error("Failed to leave group:", err)
          }
        }
        document.getElementById(`group-menu-${c.id}`)?.classList.add("hidden")
      }}
    >
      Leave group
    </button>
  )}
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
              <div className="flex-1 p-4 overflow-auto" ref={messagesRef}>
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`mb-2 max-w-prose ${
                                    m.senderId === me?.id ? 'ml-auto text-right' : ''
                                }`}
                            >
                                <div className="text-xs text-gray-600">
                                    <strong>{m.sender?.username || m.senderName}</strong> •{' '}
                                    {new Date(m.createdAt || m.ts || '').toLocaleString()}
                                </div>
                                {m.type === 'text' ? (
                                    <div className="p-2 bg-gray-100 rounded inline-block">
                                        {m.content}
                                    </div>
                                ) : (
                                    <div className="p-2 bg-blue-100 rounded inline-block">
                                        {m.type === 'image' ? (
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    downloadFile(m.id, m.fileName ?? null);
                                                }}
                                            >
                                                <img
                                                    src={`/api/chats/messages/download?messageId=${m.id}`}
                                                    alt={m.fileName || 'Image'}
                                                    className="max-w-xs cursor-pointer"
                                                />
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => downloadFile(m.id, m.fileName ?? null)}
                                                className="text-blue-600 underline flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>
                                                {m.fileName}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
            )}
          </div>

          {activeChat && (
            <div className="p-4 border-t border-gray-700 bg-gray-900">
               <div className="p-3 border-t flex gap-2">
                        <label className="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center">
                            📁
                            <input
                                type="file"
                                className="hidden"
                                onChange={onFileChange}
                            />
                        </label>
                        {file ? (
                            <div className="flex-1 flex items-center gap-2 border p-2 rounded bg-gray-100">
                                <span>{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-red-500">
                                    &times;
                                </button>
                            </div>
                        ) : (
                            <input
                                value={text}
                                onChange={onTextChange}
                                onKeyDown={onTextKeyDown}
                                className="flex-1 p-2 border rounded"
                                placeholder="Type message..."
                            />
                        )}
                        <button onClick={send} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!text.trim() && !file}>
                            Send
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

      {showRemoveModal && removeMemberGroup && (
  <RemoveMembersModal
    token={token}
    groupId={removeMemberGroup.id}         // ✅ correct prop
    currentMembers={removeMemberGroup.users}
    creatorId={removeMemberGroup.creatorId!}
    onClose={() => {
      setShowRemoveModal(false)
      setRemoveMemberGroup(null)
    }}
    onMemberRemoved={async () => {
      await loadChats(token!)
      setShowRemoveModal(false)
      setRemoveMemberGroup(null)
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
                   <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Delete Account
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
