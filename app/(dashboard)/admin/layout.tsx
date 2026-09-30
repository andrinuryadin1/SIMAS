"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { RoleBasedSidebar, SidebarMenuItem } from "@/components/role-based-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Grid3x3,
  Bell,
  Settings,
  UserCircle,
} from "lucide-react"

export default function AdminLayout({
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
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 rounded-xl" />
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Akses ditolak. Silakan login sebagai Admin.</p>
          <a href="/login" className="text-primary hover:underline text-sm font-medium">
            Login
          </a>
        </div>
      </div>
    )
  }

  const menuItems: SidebarMenuItem[] = [
    { key: "dashboard", label: "Dasbor", href: "/admin/dashboard", icon: LayoutDashboard },
    { key: "users", label: "Kelola Pengguna", href: "/admin/users", icon: Users },
    { key: "santri", label: "Kelola Santri", href: "/admin/santri", icon: BookOpen },
    { key: "master", label: "Data Master", href: "/admin/master", icon: Grid3x3 },
    { key: "pengaturan", label: "Pengaturan Reminder", href: "/admin/pengaturan/reminder", icon: Settings },
    { key: "notifikasi", label: "Log Notifikasi", href: "/admin/notifikasi", icon: Bell },
    { key: "profil", label: "Profil Saya", href: "/admin/profil", icon: UserCircle },
  ]

  return (
    <SidebarProvider>
      <RoleBasedSidebar
        role="admin"
        menuItems={menuItems}
        user={{
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
      />
      <SidebarInset>
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}