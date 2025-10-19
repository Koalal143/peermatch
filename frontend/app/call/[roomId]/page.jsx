"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { JitsiMeeting } from "@jitsi/react-sdk"

export default function CallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.roomId
  const username = searchParams.get("username") || "Пользователь"

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && roomId) {
      setIsLoading(false)
    }
  }, [user, roomId])




  if (!user || !roomId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Загрузка...</h1>
          <Button onClick={() => router.push("/chats")}>Вернуться к чатам</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/chats")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Звонок с @{username}</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full h-full">
        <div className="flex-1 w-full h-full bg-black relative" style={{ minHeight: "calc(100vh - 80px)" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-white">Подключение к звонку...</p>
              </div>
            </div>
          )}
          <div style={{ width: "100%", height: "100%", display: "flex" }}>
            <JitsiMeeting
              roomName={roomId}
              displayName={user.username}
              onReadyToClose={() => router.push("/chats")}
              domain="meet.jit.si"
              getIFrameRef={(iframeRef) => {
                if (iframeRef) {
                  iframeRef.style.width = "100%"
                  iframeRef.style.height = "100%"
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
