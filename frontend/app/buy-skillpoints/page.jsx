"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { Coins, Check, Sparkles, Zap, Crown, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BuySkillPointsPage() {
  const [selectedPackage, setSelectedPackage] = useState(null)

  const packages = [
    {
      id: 1,
      name: "Стартовый",
      skillpoints: 100,
      price: 100,
      icon: Sparkles,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      features: ["100 SkillPoints", "Идеально для начала", "Без комиссии"],
    },
    {
      id: 2,
      name: "Популярный",
      skillpoints: 300,
      price: 300,
      icon: Zap,
      color: "text-accent",
      bgColor: "bg-accent/10",
      features: ["300 SkillPoints", "Лучшее соотношение цены", "Без комиссии"],
      popular: true,
    },
    {
      id: 3,
      name: "Премиум",
      skillpoints: 600,
      price: 600,
      icon: Crown,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      features: ["600 SkillPoints", "Максимальная выгода", "Приоритетная поддержка", "Без комиссии"],
    },
  ]

  const handlePurchase = (pkg) => {
    setSelectedPackage(pkg)
    alert(
      `Покупка пакета "${pkg.name}" за ${pkg.price}₽\n\nВ beta-версии оплата недоступна. Эта функция будет доступна после запуска платформы.`,
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
            <Coins className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Купить SkillPoints</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Пополните баланс SkillPoints, чтобы учиться у лучших специалистов. Чем больше пакет — тем выгоднее цена!
          </p>
        </div>

        <Alert className="mb-8 max-w-3xl mx-auto border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Тарифы:</strong> 1 рубль = 1 SkillPoint. Простая и прозрачная система оплаты без скрытых комиссий.
          </AlertDescription>
        </Alert>

        {/* Beta Notice */}
        <Alert className="mb-8 max-w-3xl mx-auto border-accent/50 bg-accent/5">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-foreground">
            <strong>Beta-тестирование:</strong> Платформа находится в стадии тестирования. Оплата будет доступна после
            официального запуска. Сейчас вы можете ознакомиться с пакетами и ценами.
          </AlertDescription>
        </Alert>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {packages.map((pkg) => {
            const Icon = pkg.icon
            return (
              <Card
                key={pkg.id}
                className={`relative border-2 transition-all hover:shadow-xl ${
                  pkg.popular ? "border-accent shadow-lg scale-105" : "border-border hover:border-accent/50"
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${pkg.bgColor} mx-auto mb-4`}
                  >
                    <Icon className={`w-8 h-8 ${pkg.color}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                  <div className="mb-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-foreground">{pkg.price}₽</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-3xl font-bold text-accent">{pkg.skillpoints}</span>
                      <span className="text-sm text-muted-foreground">SP</span>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-2">1₽ = 1 SkillPoint</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(pkg)}
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    size="lg"
                  >
                    Купить пакет
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-accent" />
                Как работают SkillPoints?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-semibold text-foreground mb-2">💰 Зарабатывайте обучая</h3>
                <p className="text-sm">
                  Когда вы обучаете других пользователей своим навыкам, вы получаете SkillPoints. Чем больше вы
                  преподаете, тем больше зарабатываете!
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">📚 Тратьте на обучение</h3>
                <p className="text-sm">
                  Используйте SkillPoints для оплаты сессий с другими пользователями. Учитесь новому без реальных денег!
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">🚀 Ускорьте прогресс</h3>
                <p className="text-sm">
                  Покупка SkillPoints позволяет сразу начать обучение, не дожидаясь накопления баланса через
                  преподавание.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">💎 Прозрачная система</h3>
                <p className="text-sm">
                  1 рубль = 1 SkillPoint. Никаких скрытых комиссий или сложных расчетов. Простая и понятная система
                  оплаты!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
