import Link from "next/link"
import { Mail, FileText, Shield } from "lucide-react"
import Image from "next/image"

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
              <Image src="/logo.png" alt="PeerMatch" width={56} height={56} className="w-14 h-14 rounded-xl" />
              <span className="text-xl font-bold text-foreground">PeerMatch</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Платформа для обмена навыками между людьми. Учите других и учитесь сами.
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Документы
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/documents#privacy-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Shield className="w-3 h-3" />
                Политика конфиденциальности
              </Link>
              <Link
                href="/documents#user-agreement"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <FileText className="w-3 h-3" />
                Пользовательское соглашение
              </Link>
            </nav>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Контакты
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@peermatch.ru"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                support@peermatch.ru
              </a>
              <p className="text-xs text-muted-foreground">Техническая поддержка</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PeerMatch. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
