"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatWindow } from "@/components/chat-window"
import { Loader2, Phone, ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { chatService } from "@/services/chat"
import { callService } from "@/services/call"
import { useAuth } from "@/hooks/use-auth"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const chatId = parseInt(params.chatId)
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initiatingCall, setInitiatingCall] = useState(false)

  const handleInitiateCall = async () => {
    if (!chat) return
    try {
      setInitiatingCall(true)
      const call = await callService.initiateCall(chatId)
      const otherUser = chat.user1_id === user?.id ? chat.user2 : chat.user1
      router.push(`/call/${call.jitsi_room_id}?username=${encodeURIComponent(otherUser?.username || "Пользователь")}&initiator=true`)
    } catch (err) {
      console.error("Error initiating call:", err)
      setError("Ошибка при инициации звонка")
      setInitiatingCall(false)
    }
  }

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true)
        setError(null)
        const chatData = await chatService.getChat(chatId)
        setChat(chatData)
      } catch (err) {
        console.error("Error loading chat:", err)
        setError(err.message || "Ошибка при загрузке чата")
      } finally {
        setLoading(false)
      }
    }

    if (chatId && user) {
      loadChat()
    }
  }, [chatId, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push("/chats")}>Вернуться к чатам</Button>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Чат не найден</p>
        <Button onClick={() => router.push("/chats")}>Вернуться к чатам</Button>
      </div>
    )
  }

  const otherUser = chat.user1_id === user?.id ? chat.user2 : chat.user1

  return (
    <div className="w-full h-screen flex flex-col">
      <AppHeader />
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/chats")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">@{otherUser?.username || "Chat"}</h1>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleInitiateCall}
          disabled={initiatingCall}
        >
          {initiatingCall ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Phone className="w-4 h-4 mr-2" />
          )}
          Звонок
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-full">
          <ChatWindow
            chatId={chatId}
            otherUser={otherUser}
            onClose={() => router.push("/chats")}
          />
        </div>
      </div>
    </div>
  )
}

