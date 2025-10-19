"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Users, Bot, Send, Sparkles } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Привет! Я AI ассистент PeerMatch. Я могу помочь вам с информацией во время или перед звонком. Задайте мне любой вопрос!",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [requestsLeft, setRequestsLeft] = useState(5)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || requestsLeft === 0 || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Это демонстрационный ответ на ваш вопрос: "${inputValue}". В реальной версии здесь будет ответ от AI модели, которая поможет вам с информацией о навыках, подготовке к звонкам и другими вопросами.`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setRequestsLeft((prev) => prev - 1)
      setIsLoading(false)
    }, 1500)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Ассистент</h1>
              <p className="text-muted-foreground">Помощь с информацией во время или перед звонком</p>
            </div>
          </div>
        </div>

        <Card className="border-border mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Бесплатный тариф
                </CardTitle>
                <CardDescription className="text-sm">5 запросов в день для бесплатных пользователей</CardDescription>
              </div>
              <Badge variant={requestsLeft > 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
                {requestsLeft} / 5
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border h-[600px] flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-primary to-accent"
                        : "bg-primary/10 border-2 border-primary/20"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-6 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  requestsLeft > 0 ? "Задайте вопрос AI ассистенту..." : "Лимит запросов исчерпан. Обновите тариф."
                }
                className="flex-1"
                disabled={requestsLeft === 0 || isLoading}
              />
              <Button type="submit" size="icon" disabled={requestsLeft === 0 || isLoading || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {requestsLeft === 0 && (
              <p className="text-sm text-destructive mt-2">
                Вы исчерпали лимит бесплатных запросов.{" "}
                <Link href="/pricing" className="underline">
                  Обновите тариф
                </Link>{" "}
                для продолжения.
              </p>
            )}
          </form>
        </Card>
      </main>
    </div>
  )
}
