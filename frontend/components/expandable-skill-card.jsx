"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Calendar, Award, User } from "lucide-react"

export function ExpandableSkillCard({ skill, showUserInfo = true }) {
  const router = useRouter()
  const isOutgoing = skill.type === "OUTGOING"

  // Используем реальные данные пользователя из API
  const user = skill.user

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })
  }

  const handleCardClick = () => {
    router.push(`/skill/${skill.id}`)
  }

  const handleUserClick = (e) => {
    e.stopPropagation()
    if (user?.id) {
      router.push(`/profile/${user.id}`)
    }
  }

  return (
    <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        {/* User Profile Section - without avatar */}
        {showUserInfo && user && (
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <User className="w-8 h-8 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={handleUserClick}
                  className="font-semibold text-foreground truncate hover:text-primary transition-colors"
                >
                  @{user.username}
                </button>
                {user.rating && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                    {user.rating}
                  </Badge>
                )}
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{user.bio}</p>
              )}
              {(user.completedSessions || user.created_at) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {user.completedSessions && (
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {user.completedSessions} сессий
                    </span>
                  )}
                  {user.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />С {formatDate(user.created_at)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skill Information */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-foreground text-lg">{skill.name}</CardTitle>
            <Badge variant={isOutgoing ? "default" : "secondary"} className="text-xs">
              {isOutgoing ? "Обучает" : "Хочет изучить"}
            </Badge>
          </div>
          <CardDescription className="leading-relaxed text-sm line-clamp-2">{skill.description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <Button className="w-full" size="lg" variant="default" onClick={handleCardClick}>
          Показать детали
        </Button>
      </CardContent>
    </Card>
  )
}
