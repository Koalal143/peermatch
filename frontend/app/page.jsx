"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Video, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AppFooter } from "@/components/app-footer"
import { validateRegistrationForm, validateLoginForm, handleApiError, validateWithZod, schemas } from "@/lib/validation"
import { ErrorAlert } from "@/components/error-alert"
import { authService } from "@/services/auth"

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="PeerMatch" width={56} height={56} className="w-14 h-14 rounded-xl" style={{color:"transparent"}} />
            <span className="text-2xl font-bold text-foreground">PeerMatch</span>
          </Link>
          <Button onClick={() => setIsAuthOpen(true)}>Войти</Button>
        </div>
      </header>

      {!isAuthOpen ? (
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance text-foreground">
              Обменивайтесь навыками с людьми по всему миру
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              PeerMatch — это платформа, где вы можете научить других тому, что знаете сами, и научиться новому у других
              людей. Делитесь знаниями, развивайтесь вместе.
            </p>
            <Button size="lg" onClick={() => setIsAuthOpen(true)} className="text-lg px-8 py-6">
              Начать обмен навыками
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Учите и учитесь</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Делитесь своими знаниями и получайте новые навыки от других участников сообщества
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Видеозвонки</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Проводите онлайн-сессии через встроенную систему видеозвонков
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Система баллов</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Зарабатывайте SkillPoints за обучение и используйте их для получения новых знаний
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Image src="/logo.png" alt="PeerMatch" width={32} height={32} className="w-8 h-8 rounded-lg" style={{color:"transparent"}} />
                </div>
                <CardTitle className="text-foreground">Сообщество</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Присоединяйтесь к активному сообществу людей, готовых делиться знаниями
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-20 text-center">
            <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground border-0">
              <CardHeader>
                <CardTitle className="text-3xl text-primary-foreground">Готовы начать?</CardTitle>
                <CardDescription className="text-primary-foreground/80 text-lg">
                  Зарегистрируйтесь сейчас и начните обмениваться навыками
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="secondary" onClick={() => setIsAuthOpen(true)} className="text-lg px-8 py-6">
                  Создать аккаунт
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Вход в аккаунт</CardTitle>
                    <CardDescription>Войдите используя email или имя пользователя</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoginForm router={router} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit">
                      <Image src="/logo.png" alt="PeerMatch" width={44} height={44} className="w-11 h-11 rounded-xl" style={{color:"transparent"}} />
                      <span className="text-xl font-bold text-foreground">PeerMatch</span>
                    </Link>
                    <CardTitle className="text-foreground">Создать аккаунт</CardTitle>
                    <CardDescription>Заполните форму для регистрации</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm router={router} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button variant="ghost" className="w-full mt-4" onClick={() => setIsAuthOpen(false)}>
              Вернуться на главную
            </Button>
          </div>
        </main>
      )}

      <AppFooter />
    </div>
  )
}

function LoginForm({ router }) {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError(null)

    const validationErrors = validateLoginForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await authService.login(formData.emailOrUsername, formData.password)
      router.push("/dashboard")
    } catch (error) {
      const apiErrors = handleApiError(error)
      if (apiErrors._general) {
        setGeneralError(apiErrors._general)
      } else {
        setErrors(apiErrors)
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert error={generalError} onDismiss={() => setGeneralError(null)} />

      <div className="space-y-2">
        <Label htmlFor="emailOrUsername">Email или имя пользователя</Label>
        <Input
          id="emailOrUsername"
          type="text"
          value={formData.emailOrUsername}
          onChange={(e) => {
            setFormData({ ...formData, emailOrUsername: e.target.value })
            if (errors.emailOrUsername) {
              setErrors({ ...errors, emailOrUsername: undefined })
            }
          }}
          className={errors.emailOrUsername ? "border-destructive" : ""}
        />
        {errors.emailOrUsername && <p className="text-sm text-destructive">{errors.emailOrUsername}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value })
            if (errors.password) {
              setErrors({ ...errors, password: undefined })
            }
          }}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Вход..." : "Войти"}
      </Button>
    </form>
  )
}

function RegisterForm({ router }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptPrivacy: false,
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError(null)

    const validationErrors = validateRegistrationForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await authService.register(formData.username, formData.email, formData.password)
      await authService.login(formData.email, formData.password)
      router.push("/dashboard")
    } catch (error) {
      const apiErrors = handleApiError(error)
      if (apiErrors._general) {
        setGeneralError(apiErrors._general)
      } else {
        setErrors(apiErrors)
      }
      setIsLoading(false)
    }
  }

  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert error={generalError} onDismiss={() => setGeneralError(null)} />

      <div className="space-y-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => {
            setFormData({ ...formData, username: e.target.value })
            clearError("username")
          }}
          className={errors.username ? "border-destructive" : ""}
          placeholder="От 3 до 50 символов"
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value })
            clearError("email")
          }}
          className={errors.email ? "border-destructive" : ""}
          placeholder="example@email.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Пароль</Label>
        <Input
          id="register-password"
          type="password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value })
            clearError("password")
          }}
          className={errors.password ? "border-destructive" : ""}
          placeholder="Минимум 8 символов"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value })
            clearError("confirmPassword")
          }}
          className={errors.confirmPassword ? "border-destructive" : ""}
          placeholder="Повторите пароль"
        />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptPrivacy"
            checked={formData.acceptPrivacy}
            onCheckedChange={(checked) => {
              setFormData({ ...formData, acceptPrivacy: checked })
              clearError("acceptPrivacy")
            }}
            className={errors.acceptPrivacy ? "border-destructive" : ""}
          />
          <div className="space-y-1">
            <Label htmlFor="acceptPrivacy" className="text-sm font-normal leading-relaxed cursor-pointer">
              Я принимаю{" "}
              <Link href="/documents#privacy-policy" target="_blank" className="text-primary hover:underline">
                Политику конфиденциальности
              </Link>
            </Label>
            {errors.acceptPrivacy && <p className="text-xs text-destructive">{errors.acceptPrivacy}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => {
              setFormData({ ...formData, acceptTerms: checked })
              clearError("acceptTerms")
            }}
            className={errors.acceptTerms ? "border-destructive" : ""}
          />
          <div className="space-y-1">
            <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed cursor-pointer">
              Я принимаю{" "}
              <Link href="/documents#user-agreement" target="_blank" className="text-primary hover:underline">
                Пользовательское соглашение
              </Link>
            </Label>
            {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
    </form>
  )
}
