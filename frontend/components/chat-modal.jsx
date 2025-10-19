"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Loader2 } from "lucide-react"
import { chatService } from "@/services/chat"
import { useAuth } from "@/hooks/use-auth"

export function ChatModal({ isOpen, onClose, recipientUsername, recipientId }) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [chatId, setChatId] = useState(null)
  const [ws, setWs] = useState(null)
  const messagesEndRef = useRef(null)

  // Создать или получить чат при открытии модала
  useEffect(() => {
    if (!isOpen || !user || !recipientId) return

    const initChat = async () => {
      try {
        setLoading(true)
        setError(null)

        // Создать или получить чат
        const chat = await chatService.createChat(user.id, recipientId)
        setChatId(chat.id)

        // Загрузить историю сообщений
        const data = await chatService.getChatMessages(chat.id, { limit: 50, offset: 0 })
        setMessages(data.items.reverse())
      } catch (err) {
        setError(err.message || "Ошибка при загрузке чата")
      } finally {
        setLoading(false)
      }
    }

    initChat()
  }, [isOpen, user, recipientId])

  // Подключиться к WebSocket
  useEffect(() => {
    if (!isOpen || !chatId) {
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
    if (!currentToken) {
      console.log("WebSocket not connecting: token missing")
      return
    }

    console.log("Attempting WebSocket connection:", { chatId, tokenLength: currentToken?.length })

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
      console.error("WebSocket connection error:", error)
      setError("Ошибка подключения к чату")
    }

    const handleClose = () => {
      console.log("WebSocket connection closed")
    }

    const websocket = chatService.connectToChat(chatId, currentToken, handleMessage, handleError, handleClose)
    setWs(websocket)

    return () => {
      chatService.closeConnection(websocket)
    }
  }, [isOpen, chatId, token])

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="text-foreground">@{recipientUsername}</div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
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
                const isCurrentUser = message.sender_id === user?.id
                return (
                  <div key={message.id} className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {error && <div className="px-6 py-2 bg-destructive/10 text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
              maxLength={2000}
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
