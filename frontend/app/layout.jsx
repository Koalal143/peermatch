import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "PeerMatch - Обмен навыками",
  description: "Платформа для обмена навыками между людьми",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru" style={{ width: "100%", height: "100%" }}>
      <body className="font-sans antialiased flex flex-col w-full h-full" style={{ margin: 0, padding: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
