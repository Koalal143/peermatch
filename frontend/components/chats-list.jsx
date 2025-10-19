"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageSquare, User, Phone, PhoneOff, AlertCircle } from "lucide-react"
import { chatService } from "@/services/chat"
import { callService } from "@/services/call"
import { useAuth } from "@/hooks/use-auth"

export function ChatsList() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [acceptingCall, setAcceptingCall] = useState(false)
  const [rejectingCall, setRejectingCall] = useState(false)
  const wsRef = useRef(null)
  const wsConnectingRef = useRef(false)

  // Загрузить чаты
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await chatService.getUserChatsWithMessages({ limit: 50, offset: 0 })
        setChats(data.items || [])
      } catch (err) {
        console.error("Error loading chats:", err)
        setError(err.message || "Ошибка при загрузке чатов")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadChats()
    }
  }, [user])

  // Подключиться к WebSocket для получения уведомлений о звонках
  useEffect(() => {
    if (!user || !token) return

    if (wsConnectingRef.current || wsRef.current) {
      return
    }

    wsConnectingRef.current = true

    const handleMessage = (data) => {
      if (data.type === "incoming_call") {
        console.log("Incoming call:", data)
        setIncomingCall({
          id: data.call_id,
          chatId: data.chat_id,
          initiatorUsername: data.initiator_username,
          skillType: data.skill_type,
          jitsiRoomId: data.jitsi_room_id,
        })
      } else if (data.type === "call_rejected" || data.type === "call_accepted") {
        setIncomingCall(null)
      }
    }

    const handleError = (error) => {
      console.error("WebSocket error:", error)
    }

    const handleClose = () => {
      console.log("WebSocket connection closed")
      wsRef.current = null
      wsConnectingRef.current = false
    }

    // Подключиться к общему WebSocket каналу для уведомлений
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${typeof window !== "undefined" ? window.location.host : "localhost:8000"}`
    const wsUrl = apiUrl.replace(/^http/, "ws") + `/ws/notifications?token=${token}`

    try {
      const ws = new WebSocket(wsUrl)
      ws.onopen = () => {
        console.log("WebSocket connected for notifications")
        wsConnectingRef.current = false
      }
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }
      ws.onerror = handleError
      ws.onclose = handleClose
      wsRef.current = ws
    } catch (err) {
      console.error("Error connecting to WebSocket:", err)
      wsConnectingRef.current = false
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [user, token])

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`)
  }

  const handleAcceptCall = async () => {
    if (!incomingCall) return

    try {
      setAcceptingCall(true)
      const call = await callService.acceptCall(incomingCall.id)
      setIncomingCall(null)
      const roomId = call.jitsi_room_id || incomingCall.jitsiRoomId
      router.push(`/call/${roomId}?username=${incomingCall.initiatorUsername}`)
    } catch (err) {
      console.error("Error accepting call:", err)
      setError("Ошибка при принятии звонка")
    } finally {
      setAcceptingCall(false)
    }
  }

  const handleRejectCall = async () => {
    if (!incomingCall) return

    try {
      setRejectingCall(true)
      await callService.rejectCall(incomingCall.id)
      setIncomingCall(null)
    } catch (err) {
      console.error("Error rejecting call:", err)
      setError("Ошибка при отклонении звонка")
    } finally {
      setRejectingCall(false)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "только что"
    if (diffMins < 60) return `${diffMins}м назад`
    if (diffHours < 24) return `${diffHours}ч назад`
    if (diffDays < 7) return `${diffDays}д назад`

    return date.toLocaleDateString("ru-RU")
  }

  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return "Нет сообщений"
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b flex justify-center">
        <div className="w-full max-w-4xl p-4">
          <h1 className="text-2xl font-bold">Мои чаты</h1>
        </div>
      </div>

      {/* Входящий звонок */}
      {incomingCall && (
        <div className="flex justify-center px-4 pt-4">
          <div className="w-full max-w-4xl">
            <Alert className="border-green-500/50 bg-green-500/10">
              <Phone className="h-4 w-4 text-green-600 animate-pulse" />
              <AlertDescription className="ml-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Входящий звонок от @{incomingCall.initiatorUsername}
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      Тип: {incomingCall.skillType === "teaching" ? "Обучение" : "Научение"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleAcceptCall}
                      disabled={acceptingCall || rejectingCall}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {acceptingCall ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      Принять
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRejectCall}
                      disabled={acceptingCall || rejectingCall}
                    >
                      {rejectingCall ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <PhoneOff className="w-4 h-4 mr-2" />
                      )}
                      Отклонить
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">У вас еще нет чатов</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/users")}
                >
                  Найти пользователя
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {chats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="rounded-none border-0 border-b cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">
                              @{chat.other_user?.username || "Unknown"}
                            </h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatTime(chat.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {chat.last_message
                              ? truncateMessage(chat.last_message.text)
                              : "Нет сообщений"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

