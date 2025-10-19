"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Star, Calendar, Award, User, MessageCircle, Video, Mail, Loader2 } from "lucide-react"
import { ChatModal } from "@/components/chat-modal"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { skillsService } from "@/services/skills"

export default function SkillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const skillId = Number.parseInt(params.id)
  const [skill, setSkill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setLoading(true)
        const data = await skillsService.getSkillById(skillId)
        setSkill(data)
      } catch (err) {
        setError(err.message || "Ошибка при загрузке навыка")
      } finally {
        setLoading(false)
      }
    }

    if (skillId) {
      fetchSkill()
    }
  }, [skillId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{error || "Навык не найден"}</p>
            <Link href="/search">
              <Button>Вернуться к поиску</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = skill.user
  const isOutgoing = skill.type === "OUTGOING"

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })
  }

  const handleCall = () => {
    const roomId = `peermatch-${user.id}-${skill.id}-${Date.now()}`
    router.push(`/call/${roomId}?username=${encodeURIComponent(user.username)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="pl-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            {/* User Profile Section */}
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                <User className="w-12 h-12 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">@{user.username}</h2>
                  {user.rating && (
                    <Badge variant="secondary" className="text-sm">
                      <Star className="w-4 h-4 mr-1 fill-yellow-500 text-yellow-500" />
                      {user.rating}
                    </Badge>
                  )}
                </div>
                {user.bio && (
                  <p className="text-muted-foreground leading-relaxed mb-3">{user.bio}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {user.completedSessions && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {user.completedSessions} завершенных сессий
                    </span>
                  )}
                  {user.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      На платформе с {formatDate(user.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Skill Information */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <CardTitle className="text-3xl text-foreground">{skill.name}</CardTitle>
                <Badge variant={isOutgoing ? "default" : "secondary"} className="text-sm">
                  {isOutgoing ? "Обучает" : "Хочет изучить"}
                </Badge>
              </div>
              {skill.description && (
                <CardDescription className="text-base leading-relaxed">{skill.description}</CardDescription>
              )}
              {skill.created_at && (
                <p className="text-sm text-muted-foreground mt-3">Добавлено: {formatDate(skill.created_at)}</p>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Separator className="mb-6" />

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Контактная информация</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-transparent" variant="outline" size="lg" onClick={() => setIsChatOpen(true)}>
                <MessageCircle className="w-5 h-5 mr-2" />
                Написать в чат
              </Button>
              <Button className="flex-1" size="lg" onClick={handleCall}>
                <Video className="w-5 h-5 mr-2" />
                Предложить звонок
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientUsername={user.username}
        recipientId={user.id}
      />
    </div>
  )
}
