"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Sparkles, Crown, Info } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function PricingPage() {
  const plans = [
    {
      name: "Бесплатный тариф",
      price: "0 ₽",
      period: "навсегда",
      icon: Sparkles,
      color: "from-gray-500 to-gray-600",
      features: ["До 2 созвонов в день", "Нет бонусных SkillCoins", "Нет приоритетного мэтчинга"],
      buttonText: "Текущий тариф",
      buttonVariant: "outline",
      current: true,
    },
    {
      name: "Платный тариф",
      price: "49 ₽",
      period: "в месяц",
      icon: Crown,
      color: "from-primary to-accent",
      features: ["Неограниченное количество созвонов", "Бонусные SkillCoins каждый месяц", "Приоритет при мэтчинге"],
      buttonText: "Выбрать тариф",
      buttonVariant: "default",
      current: false,
    },
  ]

  const handleSelectPlan = (planName) => {
    alert(`Выбран тариф: ${planName}. Оплата недоступна во время бета-тестирования.`)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-foreground text-balance">Выберите свой тариф</h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              Получите больше возможностей для обмена навыками с платным тарифом
            </p>
          </div>

          <Alert className="mb-8 border-primary/50 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertDescription className="text-base leading-relaxed ml-2">
              Сайт находится в <strong>бета-тестировании</strong>, поэтому оплата пока недоступна. Все функции доступны
              бесплатно для тестирования.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const IconComponent = plan.icon
              return (
                <Card key={plan.name} className="border-border">
                  <CardHeader className="text-center pb-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-foreground mb-2">{plan.name}</CardTitle>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    </div>
                    {plan.current && <Badge variant="secondary">Текущий тариф</Badge>}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.buttonVariant}
                      disabled={plan.current}
                      onClick={() => handleSelectPlan(plan.name)}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Comparison Table */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground text-center">Сравнение тарифов</CardTitle>
              <CardDescription className="text-center">Подробное сравнение возможностей каждого тарифа</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-foreground font-semibold">Функция</th>
                      <th className="text-center py-4 px-4 text-foreground font-semibold">Бесплатный</th>
                      <th className="text-center py-4 px-4 text-foreground font-semibold">Платный</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-muted-foreground">Созвонов в день</td>
                      <td className="text-center py-4 px-4 text-foreground">До 2</td>
                      <td className="text-center py-4 px-4 text-foreground">Неограниченно</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-muted-foreground">Бонусные SkillCoins</td>
                      <td className="text-center py-4 px-4 text-foreground">-</td>
                      <td className="text-center py-4 px-4 text-foreground">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-muted-foreground">Приоритетный мэтчинг</td>
                      <td className="text-center py-4 px-4 text-foreground">-</td>
                      <td className="text-center py-4 px-4 text-foreground">
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
