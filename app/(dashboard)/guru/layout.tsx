"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { RoleBasedSidebar, SidebarMenuItem } from "@/components/role-based-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-context"
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Heart,
  Shield,
  TrendingUp,
  FileText,
  AlertCircle,
  Users,
  UserCircle,
} from "lucide-react"

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r bg-card p-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 rounded-xl" />
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user || user.role !== "guru") {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Akses ditolak. Silakan login sebagai Guru.</p>
          <a href="/login" className="text-primary hover:underline text-sm font-medium">Login</a>
        </div>
      </div>
    )
  }

  const menuItems: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dasbor", href: "/guru/dashboard", icon: LayoutDashboard },
    { key: "absensi", label: "Absensi Harian", href: "/guru/absensi", icon: Calendar },
    { key: "hafalan", label: "Setoran Hafalan", href: "/guru/hafalan", icon: BookOpen },
    { key: "adab", label: "Penilaian Adab", href: "/guru/adab", icon: Heart },
    { key: "perilaku", label: "Catatan Perilaku", href: "/guru/perilaku", icon: Shield },
    { key: "perkembangan", label: "Perkembangan", href: "/guru/perkembangan", icon: TrendingUp },
    { key: "jurnal", label: "Jurnal Mengajar", href: "/guru/jurnal", icon: FileText },
    { key: "kasus", label: "Kasus", href: "/guru/kasus", icon: AlertCircle },
    { key: "santri", label: "Santri Saya", href: "/guru/santri", icon: Users },
    { key: "profil", label: "Profil", href: "/guru/profil", icon: UserCircle },
  ]

  return (
    <SidebarProvider>
      <RoleBasedSidebar
        role="guru"
        menuItems={menuItems}
        user={{ fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }}
      />
      <SidebarInset>
        <DashboardHeader user={user} unreadCount={3} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}