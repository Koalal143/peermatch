"use client"

import { AppHeader } from "@/components/app-header"
import { ChatsList } from "@/components/chats-list"

export default function ChatsPage() {
  return (
    <div className="w-full h-screen flex flex-col">
      <AppHeader />
      <ChatsList />
    </div>
  )
}

