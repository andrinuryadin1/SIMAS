"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LucideIcon, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export interface SidebarMenuItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "warning"
}

interface RoleBasedSidebarProps {
  role: "admin" | "guru" | "manajemen"
  menuItems: SidebarMenuItem[]
  user?: {
    fullName: string
    email: string
    avatarUrl?: string
  }
}

const roleConfig = {
  admin: {
    label: "Admin",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
  guru: {
    label: "Guru",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  manajemen: {
    label: "Manajemen",
    color: "text-amber-800",
    bg: "bg-amber-50 border-amber-200",
  },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function RoleBasedSidebar({ role, menuItems, user }: RoleBasedSidebarProps) {
  const pathname = usePathname()
  const config = roleConfig[role]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white shadow-xs">
      {/* Logo Header — exact h-14 (56px) matching DashboardHeader */}
      <SidebarHeader className="h-14 flex items-center justify-center p-0 px-3 border-b border-slate-200 group-data-[collapsible=icon]:px-0">
        <Link
          href={`/${role}/dashboard`}
          className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
        >
          {/* Official Logo mark */}
          <div className="relative size-8 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200 p-0.5 shadow-xs flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo Kuttab Al-Fatih"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col gap-0 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-sm font-extrabold leading-tight text-slate-900 truncate">
                SiMas
              </span>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.2 rounded-full border", config.bg, config.color)}>
                {config.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium leading-tight truncate">
              Kuttab Al-Fatih Bandung
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="pt-2 px-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:items-center">
        <SidebarGroup className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
          <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-slate-400 px-3 py-1.5 group-data-[collapsible=icon]:hidden">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:w-full">
            <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:space-y-1.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:w-full">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <SidebarMenuItem key={item.key} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "h-10 px-3 rounded-xl text-sm font-medium transition-colors group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center",
                        active
                          ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-xs"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                        <Icon className={cn("size-5 shrink-0", active ? "text-primary stroke-[2.5]" : "text-slate-600")} />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="right-2 group-data-[collapsible=icon]:hidden">
                        <Badge
                          variant={item.badgeVariant || "secondary"}
                          className="h-5 min-w-5 text-[10px] px-1.5 font-bold"
                        >
                          {item.badge}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />

      {/* Footer: User + Logout */}
      <SidebarFooter className="p-3 bg-slate-50/50 border-t border-slate-200 mt-auto group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mb-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 shrink-0 ring-2 ring-emerald-600/20">
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback className="bg-primary text-white text-xs font-bold">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-xs font-bold text-slate-900">
                {user.fullName}
              </span>
              <span className="truncate text-[11px] text-slate-500 font-medium">
                {user.email}
              </span>
            </div>
          </div>
        )}
        <SidebarMenu className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              tooltip="Keluar"
              className="h-9 px-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition-colors group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="size-4.5 shrink-0 text-rose-500" />
              <span className="group-data-[collapsible=icon]:hidden">Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
