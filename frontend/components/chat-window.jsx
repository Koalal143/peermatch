"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, X, Phone } from "lucide-react"
import { chatService } from "@/services/chat"
import { callService } from "@/services/call"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function ChatWindow({ chatId, otherUser, onClose }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [ws, setWs] = useState(null)
  const [initiatingCall, setInitiatingCall] = useState(false)
  const scrollRef = useRef(null)
  const messagesEndRef = useRef(null)
  const wsConnectingRef = useRef(false)
  const wsRef = useRef(null)

  // Загрузить историю сообщений
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true)
        const data = await chatService.getChatMessages(chatId, { limit: 50, offset: 0 })
        // Сообщения приходят в обратном порядке (новые первыми), поэтому разворачиваем
        setMessages(data.items.reverse())
      } catch (err) {
        setError(err.message || "Ошибка при загрузке сообщений")
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [chatId])

  // Подключиться к WebSocket
  useEffect(() => {
    if (!chatId) return

    // Если уже подключаемся или подключены, не создавай новое соединение
    if (wsConnectingRef.current || wsRef.current) {
      return
    }

    // Получить текущий токен из localStorage если он еще не загружен в state
    const getToken = () => {
      if (token) return token
      if (typeof window !== "undefined") {
        return localStorage.getItem("access_token")
      }
      return null
    }

    const currentToken = getToken()
    if (!currentToken) return

    wsConnectingRef.current = true

    const handleMessage = (data) => {
      if (data.type === "connection") {
        console.log("WebSocket connected:", data)
        setError(null)
      } else if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            chat_id: data.chat_id,
            sender_id: data.sender_id,
            sender_username: data.sender_username,
            text: data.text,
            created_at: data.created_at,
          },
        ])
      } else if (data.type === "error") {
        setError(data.message)
      }
    }

    const handleError = (error) => {
      setError("Ошибка подключения к чату")
    }

    const handleClose = () => {
      console.log("WebSocket connection closed")
      wsRef.current = null
      wsConnectingRef.current = false
    }

    const websocket = chatService.connectToChat(chatId, currentToken, handleMessage, handleError, handleClose)
    wsRef.current = websocket
    wsConnectingRef.current = false
    setWs(websocket)

    return () => {
      if (wsRef.current) {
        chatService.closeConnection(wsRef.current)
        wsRef.current = null
      }
    }
  }, [chatId])

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setSending(true)
    setError(null)

    try {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setError("Соединение с чатом не установлено. Попробуйте позже.")
        return
      }
      chatService.sendWebSocketMessage(ws, newMessage)
      setNewMessage("")
    } catch (err) {
      setError(err.message || "Ошибка при отправке сообщения")
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }

  const handleInitiateCall = async () => {
    try {
      setInitiatingCall(true)
      setError(null)
      const call = await callService.initiateCall(chatId)
      console.log("Call initiated:", call)
      router.push(`/call/${call.jitsi_room_id}?username=${encodeURIComponent(otherUser?.username || "Пользователь")}&initiator=true`)
    } catch (err) {
      console.error("Error initiating call:", err)
      setError("Ошибка при инициации звонка")
    } finally {
      setInitiatingCall(false)
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Сообщения */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Нет сообщений. Начните разговор!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.id
                return (
                  <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {!isOwn && <p className="text-xs font-semibold mb-1">{message.sender_username}</p>}
                      <p className="break-words">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{formatTime(message.created_at)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Ошибка */}
        {error && <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Форма отправки */}
        <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
          <Input
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={2000}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

