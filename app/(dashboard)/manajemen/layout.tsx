"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { RoleBasedSidebar, SidebarMenuItem } from "@/components/role-based-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-context"
import {
  LayoutDashboard,
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  FileText,
  Mail,
  UserCircle,
} from "lucide-react"

export default function ManajemenLayout({
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

  if (!user || user.role !== "manajemen") {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Akses ditolak. Silakan login sebagai Manajemen.</p>
          <a href="/login" className="text-primary hover:underline text-sm font-medium">Login</a>
        </div>
      </div>
    )
  }

  const menuItems: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dasbor Eksekutif", href: "/manajemen/dashboard", icon: LayoutDashboard },
    { key: "santri", label: "Buku Induk Santri", href: "/manajemen/santri", icon: Users },
    { key: "analitik", label: "Statistik & Analitik", href: "/manajemen/analitik", icon: BarChart3 },
    { key: "guru", label: "Monitoring Guru", href: "/manajemen/guru", icon: TrendingUp },
    { key: "kasus", label: "Monitoring Kasus", href: "/manajemen/kasus", icon: AlertCircle },
    { key: "laporan", label: "Laporan & Export", href: "/manajemen/laporan", icon: FileText },
    { key: "notifikasi", label: "Notifikasi", href: "/manajemen/notifikasi", icon: Mail },
    { key: "profil", label: "Profil", href: "/manajemen/profil", icon: UserCircle },
  ]

  return (
    <SidebarProvider>
      <RoleBasedSidebar
        role="manajemen"
        menuItems={menuItems}
        user={{ fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }}
      />
      <SidebarInset>
        <DashboardHeader user={user} unreadCount={1} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}