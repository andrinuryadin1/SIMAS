"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ChevronRight, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { NotificationBell } from "@/components/notification-bell"

interface DashboardHeaderProps {
  user: {
    fullName: string
    email: string
    role: "admin" | "guru" | "manajemen"
    avatarUrl?: string
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  manajemen: "Manajemen",
  dashboard: "Dasbor",
  santri: "Santri",
  users: "Pengguna",
  master: "Data Master",
  pengaturan: "Pengaturan",
  notifikasi: "Notifikasi",
  profil: "Profil",
  tambah: "Tambah",
  edit: "Edit",
  detail: "Detail",
  reminder: "Reminder",
  hafalan: "Hafalan",
  absensi: "Absensi",
  adab: "Adab",
  keuangan: "Keuangan",
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = [
      { label: "Beranda", href: `/${segments[0]}/dashboard` },
    ]

    segments.slice(1).forEach((seg, i) => {
      const label = segmentLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
      const href = "/" + segments.slice(0, i + 2).join("/")
      if (i > 0 || seg !== "dashboard") {
        breadcrumbs.push({ label, href })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md shadow-xs">
      {/* Sidebar trigger */}
      <SidebarTrigger className="-ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100" />
      <span className="h-4 w-px bg-slate-200 shrink-0 mx-0.5" />

      {/* Breadcrumb */}
      <nav className="flex flex-1 items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
            {index > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-slate-400" />
            )}
            <Link
              href={crumb.href}
              className={
                index === breadcrumbs.length - 1
                  ? "text-slate-900 font-bold truncate text-sm"
                  : "text-slate-500 hover:text-slate-900 transition-colors truncate text-sm font-medium"
              }
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationBell role={user.role} />

        <Separator orientation="vertical" className="h-4 bg-slate-200" />

        {/* User profile */}
        <Link
          href={`/${user.role}/profil`}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors"
        >
          <Avatar className="size-7.5 ring-1 ring-slate-200">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback className="bg-primary text-white text-xs font-bold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-xs font-bold leading-tight text-slate-900">
              {user.fullName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight capitalize">
              {user.role}
            </span>
          </div>
        </Link>
      </div>
    </header>
  )
}
