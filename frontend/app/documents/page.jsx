import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 flex-1">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Юридические документы</h1>
            <p className="text-muted-foreground text-lg">
              Ознакомьтесь с нашими правилами и политикой конфиденциальности
            </p>
          </div>

          {/* Privacy Policy */}
          <Card id="privacy-policy" className="scroll-mt-24">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Политика конфиденциальности</CardTitle>
              </div>
              <CardDescription>Последнее обновление: {new Date().toLocaleDateString("ru-RU")}</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">1. Общие положения</h3>
                <p className="leading-relaxed">
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
                  пользователей платформы PeerMatch (далее — «Платформа»). Используя Платформу, вы соглашаетесь с
                  условиями данной Политики.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">2. Собираемая информация</h3>
                <p className="leading-relaxed mb-2">Мы собираем следующие типы информации:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Регистрационные данные: имя пользователя, адрес электронной почты, пароль</li>
                  <li>Информация о навыках: описание навыков, которые вы предлагаете или хотите изучить</li>
                  <li>Данные о взаимодействии: история сессий, сообщения в чате, рейтинги</li>
                  <li>Технические данные: IP-адрес, тип браузера, операционная система</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">3. Использование информации</h3>
                <p className="leading-relaxed mb-2">Собранная информация используется для:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Предоставления и улучшения услуг Платформы</li>
                  <li>Подбора подходящих партнеров для обмена навыками</li>
                  <li>Обеспечения безопасности и предотвращения мошенничества</li>
                  <li>Связи с пользователями по вопросам поддержки</li>
                  <li>Анализа использования Платформы и улучшения пользовательского опыта</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">4. Защита данных</h3>
                <p className="leading-relaxed">
                  Мы применяем современные технические и организационные меры для защиты ваших персональных данных от
                  несанкционированного доступа, изменения, раскрытия или уничтожения. Все данные передаются по
                  защищенным каналам связи с использованием шифрования.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">5. Передача данных третьим лицам</h3>
                <p className="leading-relaxed">
                  Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев,
                  предусмотренных законодательством, или когда это необходимо для предоставления услуг Платформы
                  (например, использование сервиса видеозвонков Jitsi).
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">6. Ваши права</h3>
                <p className="leading-relaxed mb-2">Вы имеете право:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Получать доступ к своим персональным данным</li>
                  <li>Исправлять неточные или неполные данные</li>
                  <li>Удалять свои персональные данные</li>
                  <li>Ограничивать обработку данных</li>
                  <li>Возражать против обработки данных</li>
                  <li>Получать копию своих данных в структурированном формате</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">7. Cookies и аналитика</h3>
                <p className="leading-relaxed">
                  Мы используем cookies и аналогичные технологии для улучшения работы Платформы, анализа трафика и
                  персонализации контента. Вы можете управлять настройками cookies в своем браузере.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">8. Изменения в Политике</h3>
                <p className="leading-relaxed">
                  Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. О существенных
                  изменениях мы уведомим вас по электронной почте или через уведомления на Платформе.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">9. Контактная информация</h3>
                <p className="leading-relaxed">
                  По вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам по адресу:{" "}
                  <a href="mailto:privacy@peermatch.ru" className="text-primary hover:underline">
                    privacy@peermatch.ru
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>

          {/* User Agreement */}
          <Card id="user-agreement" className="scroll-mt-24">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-2xl">Пользовательское соглашение</CardTitle>
              </div>
              <CardDescription>Последнее обновление: {new Date().toLocaleDateString("ru-RU")}</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">1. Предмет соглашения</h3>
                <p className="leading-relaxed">
                  Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между администрацией
                  платформы PeerMatch (далее — «Администрация») и пользователями Платформы (далее — «Пользователь»).
                  Регистрируясь на Платформе, Пользователь принимает условия настоящего Соглашения в полном объеме.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">2. Регистрация и учетная запись</h3>
                <p className="leading-relaxed mb-2">
                  Для использования Платформы Пользователь должен пройти регистрацию. При регистрации Пользователь
                  обязуется:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Предоставлять достоверную и актуальную информацию</li>
                  <li>Поддерживать безопасность своей учетной записи</li>
                  <li>Не передавать доступ к своей учетной записи третьим лицам</li>
                  <li>Немедленно уведомлять Администрацию о любом несанкционированном использовании учетной записи</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">3. Правила использования Платформы</h3>
                <p className="leading-relaxed mb-2">Пользователь обязуется:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Использовать Платформу только в законных целях</li>
                  <li>Уважительно относиться к другим пользователям</li>
                  <li>Не размещать оскорбительный, незаконный или неприемлемый контент</li>
                  <li>Не использовать Платформу для мошенничества или обмана</li>
                  <li>Соблюдать авторские права и права интеллектуальной собственности</li>
                  <li>Не пытаться получить несанкционированный доступ к системам Платформы</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">4. Система SkillPoints</h3>
                <p className="leading-relaxed">
                  SkillPoints — это внутренняя валюта Платформы, используемая для обмена навыками. Пользователи
                  зарабатывают SkillPoints, обучая других, и тратят их на получение знаний. SkillPoints можно приобрести
                  за реальные деньги. SkillPoints не подлежат обмену на реальные деньги и не имеют денежной стоимости
                  вне Платформы.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">5. Платные услуги</h3>
                <p className="leading-relaxed">
                  Платформа предлагает платные тарифы и возможность покупки SkillPoints. Оплата производится через
                  безопасные платежные системы. Все платежи являются окончательными и не подлежат возврату, за
                  исключением случаев, предусмотренных законодательством.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">6. Ответственность</h3>
                <p className="leading-relaxed">
                  Администрация не несет ответственности за качество обучения, предоставляемого пользователями друг
                  другу. Платформа выступает только в качестве посредника, обеспечивающего техническую возможность для
                  обмена навыками. Пользователи самостоятельно несут ответственность за содержание своих материалов и
                  взаимодействие с другими пользователями.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">7. Интеллектуальная собственность</h3>
                <p className="leading-relaxed">
                  Все права на Платформу, включая дизайн, программное обеспечение, логотипы и товарные знаки,
                  принадлежат Администрации. Пользователи сохраняют права на контент, который они размещают на
                  Платформе, но предоставляют Администрации неисключительную лицензию на использование этого контента
                  для целей функционирования Платформы.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">8. Прекращение использования</h3>
                <p className="leading-relaxed">
                  Администрация оставляет за собой право приостановить или прекратить доступ Пользователя к Платформе в
                  случае нарушения условий настоящего Соглашения. Пользователь может в любое время удалить свою учетную
                  запись через настройки профиля.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">9. Изменения в Соглашении</h3>
                <p className="leading-relaxed">
                  Администрация оставляет за собой право вносить изменения в настоящее Соглашение. О существенных
                  изменениях Пользователи будут уведомлены по электронной почте или через уведомления на Платформе.
                  Продолжение использования Платформы после внесения изменений означает согласие с новыми условиями.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">10. Применимое право</h3>
                <p className="leading-relaxed">
                  Настоящее Соглашение регулируется законодательством Российской Федерации. Все споры, возникающие из
                  настоящего Соглашения, подлежат разрешению в соответствии с законодательством РФ.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">11. Контактная информация</h3>
                <p className="leading-relaxed">
                  По вопросам, связанным с настоящим Соглашением, вы можете обратиться к нам по адресу:{" "}
                  <a href="mailto:support@peermatch.ru" className="text-primary hover:underline">
                    support@peermatch.ru
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
