import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import "../styles.css"

export const metadata: Metadata = {
  title: "Faiz UI — Premium UI Kit & Starter Kit for shadcn/ui",
  description:
    "Faiz UI is a premium, production-ready UI kit and boilerplate built on shadcn/ui and Tailwind CSS. 60+ components, ready-made blocks, and sensible defaults so you ship polished interfaces faster.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
