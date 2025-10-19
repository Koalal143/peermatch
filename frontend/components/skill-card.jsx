"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Trash2, Edit } from "lucide-react"
import { skillsService } from "@/services/skills"

export function SkillCard({ skill, onDelete, onEdit, showActions = true, showContact = false }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const isOutgoing = skill.type === "OUTGOING"

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот навык?")) {
      return
    }

    setIsDeleting(true)
    try {
      await skillsService.deleteSkill(skill.id)
      onDelete(skill.id)
    } catch (error) {
      console.error("Failed to delete skill:", error)
      alert("Ошибка при удалении навыка")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-border hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-foreground">{skill.name}</CardTitle>
              <Badge variant={isOutgoing ? "default" : "secondary"}>{isOutgoing ? "Обучаю" : "Хочу изучить"}</Badge>
            </div>
            {skill.username && <p className="text-sm text-muted-foreground">@{skill.username}</p>}
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => onEdit(skill)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
        <CardDescription className="leading-relaxed">{skill.description}</CardDescription>
      </CardHeader>
      {showContact && (
        <CardContent>
          <Button className="w-full bg-transparent" variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Связаться
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
