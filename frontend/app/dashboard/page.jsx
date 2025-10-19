"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, LogOut, Award, Edit } from "lucide-react"
import { SkillCard } from "@/components/skill-card"
import { SkillForm } from "@/components/skill-form"
import { AppHeader } from "@/components/app-header"
import { validateProfileForm, handleApiError } from "@/lib/validation"
import { ErrorAlert } from "@/components/error-alert"
import { authService } from "@/services/auth"
import { usersService } from "@/services/users"
import { skillsService } from "@/services/skills"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addSkillType, setAddSkillType] = useState("OUTGOING")
  const [editingSkill, setEditingSkill] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileGeneralError, setProfileGeneralError] = useState(null)

  // Загрузить данные пользователя и навыки при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/")
          return
        }

        const userData = await usersService.getCurrentUser()
        setUser(userData)
        setProfileForm({
          username: userData.username,
          email: userData.email,
        })

        const skillsData = await skillsService.getUserSkills(userData.id)
        setSkills(skillsData)
      } catch (error) {
        console.error("Failed to load data:", error)
        if (error.status === 401) {
          authService.logout()
          router.push("/")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddSkill = async (formData) => {
    try {
      const skillData = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
      }
      const newSkill = await skillsService.createSkill(skillData)
      setSkills([...skills, newSkill])
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add skill:", error)
      throw error
    }
  }

  const handleEditSkill = async (formData) => {
    try {
      const skillData = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
      }
      const updatedSkill = await skillsService.updateSkill(editingSkill.id, skillData)
      setSkills(skills.map((s) => (s.id === editingSkill.id ? updatedSkill : s)))
      setEditingSkill(null)
    } catch (error) {
      console.error("Failed to update skill:", error)
      throw error
    }
  }

  const handleDeleteSkill = (id) => {
    setSkills(skills.filter((s) => s.id !== id))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileGeneralError(null)

    const validationErrors = validateProfileForm(profileForm)
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors)
      return
    }

    try {
      const updateData = {}
      if (profileForm.username !== user.username) {
        updateData.username = profileForm.username
      }
      if (profileForm.email !== user.email) {
        updateData.email = profileForm.email
      }

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await usersService.updateProfile(updateData)
        setUser(updatedUser)
      }

      setIsEditingProfile(false)
      setProfileErrors({})
    } catch (error) {
      const apiErrors = handleApiError(error)
      if (apiErrors._general) {
        setProfileGeneralError(apiErrors._general)
      } else {
        setProfileErrors(apiErrors)
      }
    }
  }

  const handleLogout = () => {
    if (confirm("Вы уверены, что хотите выйти?")) {
      authService.logout()
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Загрузка...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Ошибка загрузки профиля</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const outgoingSkills = skills.filter((s) => s.type === "OUTGOING")
  const incomingSkills = skills.filter((s) => s.type === "INCOMING")

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* User Info Card */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl text-foreground">@{user.username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg">
                  <Award className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">SkillPoints</p>
                    <p className="text-2xl font-bold text-accent">{user.skillpoints}</p>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => setIsEditingProfile(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Skills Management */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Мои навыки</h2>
          <Button onClick={() => {
            setAddSkillType("OUTGOING")
            setIsAddDialogOpen(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить навык
          </Button>
        </div>

        <Tabs defaultValue="outgoing" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="outgoing">Обучаю ({outgoingSkills.length})</TabsTrigger>
            <TabsTrigger value="incoming">Хочу изучить ({incomingSkills.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="outgoing">
            {outgoingSkills.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">У вас пока нет навыков для обучения</p>
                  <Button onClick={() => {
                    setAddSkillType("OUTGOING")
                    setIsAddDialogOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить первый навык
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {outgoingSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onDelete={handleDeleteSkill}
                    onEdit={setEditingSkill}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incoming">
            {incomingSkills.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">У вас пока нет навыков для изучения</p>
                  <Button onClick={() => {
                    setAddSkillType("INCOMING")
                    setIsAddDialogOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить первый навык
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {incomingSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onDelete={handleDeleteSkill}
                    onEdit={setEditingSkill}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>Измените информацию о вашем профиле</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <ErrorAlert error={profileGeneralError} onDismiss={() => setProfileGeneralError(null)} />

            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={profileForm.username}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, username: e.target.value })
                  if (profileErrors.username) {
                    setProfileErrors({ ...profileErrors, username: undefined })
                  }
                }}
                className={profileErrors.username ? "border-destructive" : ""}
                placeholder="От 3 до 50 символов"
              />
              {profileErrors.username && <p className="text-sm text-destructive">{profileErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, email: e.target.value })
                  if (profileErrors.email) {
                    setProfileErrors({ ...profileErrors, email: undefined })
                  }
                }}
                className={profileErrors.email ? "border-destructive" : ""}
                placeholder="example@email.com"
              />
              {profileErrors.email && <p className="text-sm text-destructive">{profileErrors.email}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый навык</DialogTitle>
            <DialogDescription>Заполните информацию о навыке, который вы хотите добавить</DialogDescription>
          </DialogHeader>
          <SkillForm initialType={addSkillType} onSubmit={handleAddSkill} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать навык</DialogTitle>
            <DialogDescription>Измените информацию о навыке</DialogDescription>
          </DialogHeader>
          <SkillForm skill={editingSkill} onSubmit={handleEditSkill} onCancel={() => setEditingSkill(null)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
