"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Coins, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { mockUser } from "@/lib/mock-data"
import Image from "next/image"

export function AppHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Профиль" },
    { href: "/search", label: "Поиск" },
    { href: "/chats", label: "Чаты" },
    { href: "/ai-assistant", label: "AI Ассистент" },
    { href: "/pricing", label: "Тарифы" },
  ]

  const isActive = (href) => pathname === href

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="PeerMatch" width={64} height={64} className="w-16 h-16 rounded-xl" />
          <div>
            <span className="text-2xl font-bold text-foreground block">PeerMatch</span>
            <span className="text-xs text-muted-foreground">Обмен навыками</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Menu className="w-5 h-5" />
                Навигация
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 font-semibold hover:bg-accent/10 transition-colors bg-transparent"
              >
                <Coins className="w-5 h-5 text-accent" />
                <span className="text-accent">{mockUser.skillpoints}</span>
                <span className="text-muted-foreground text-sm">SP</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-accent" />
                Ваш баланс
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-accent">{mockUser.skillpoints}</span>
                  <span className="text-sm text-muted-foreground">SkillPoints</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Зарабатывайте обучая других и тратьте на обучение</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/buy-skillpoints" className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Купить SkillPoints
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
            <div className="mb-6 mt-8 p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Ваш баланс</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-accent">{mockUser.skillpoints}</span>
                <span className="text-sm text-muted-foreground">SP</span>
              </div>
              <Link href="/buy-skillpoints" onClick={() => setIsOpen(false)}>
                <Button variant="default" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Купить SkillPoints
                </Button>
              </Link>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button variant={isActive(item.href) ? "default" : "ghost"} className="w-full justify-start">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
