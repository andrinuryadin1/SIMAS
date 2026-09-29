"use client"

import { Agentation } from "agentation"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      {process.env.NODE_ENV !== "production" && <Agentation />}
    </ThemeProvider>
  )
}
