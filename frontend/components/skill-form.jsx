"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { validateSkillForm, handleApiError } from "@/lib/validation"
import { ErrorAlert } from "@/components/error-alert"

export function SkillForm({ skill, onSubmit, onCancel, initialType = "OUTGOING" }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: initialType,
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        description: skill.description || "",
        type: skill.type,
      })
    }
  }, [skill])

  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError(null)

    const validationErrors = validateSkillForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await onSubmit(formData)
    } catch (error) {
      const apiErrors = handleApiError(error)
      if (apiErrors._general) {
        setGeneralError(apiErrors._general)
      } else {
        setErrors(apiErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert error={generalError} onDismiss={() => setGeneralError(null)} />

      <div className="space-y-2">
        <Label htmlFor="name">Название навыка</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value })
            clearError("name")
          }}
          className={errors.name ? "border-destructive" : ""}
          placeholder="Например: JavaScript, Игра на гитаре"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        <p className="text-xs text-muted-foreground">От 1 до 255 символов</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value })
            clearError("description")
          }}
          className={errors.description ? "border-destructive" : ""}
          placeholder="Опишите подробнее, что вы можете предложить или что хотите изучить"
          rows={4}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        <p className="text-xs text-muted-foreground">Максимум 1000 символов ({formData.description.length}/1000)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Тип навыка</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OUTGOING">Обучаю (OUTGOING)</SelectItem>
            <SelectItem value="INCOMING">Хочу изучить (INCOMING)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Сохранение..." : skill ? "Сохранить" : "Добавить навык"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
