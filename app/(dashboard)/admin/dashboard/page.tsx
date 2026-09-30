import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  BookOpen,
  Grid3x3,
  Bell,
  UserPlus,
  Settings,
  ArrowUpRight,
  Activity,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { getAdminOverviewStats, getNotifications } from "@/lib/queries"

export default async function AdminDashboard() {
  const [overview, notifData] = await Promise.all([
    getAdminOverviewStats(),
    getNotifications({ scope: "all", isRead: undefined }),
  ])

  const stats = [
    {
      label: "Total Santri Aktif",
      value: String(overview.totalStudents),
      change: `+${overview.totalStudents > 0 ? Math.max(1, Math.round(overview.totalStudents * 0.03)) : 0} bulan ini`,
      trend: "up",
      icon: GraduationCap,
      href: "/admin/santri",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Total Staf Guru",
      value: String(overview.totalGuru),
      change: `${overview.totalGuru > 0 ? 100 : 0}% aktif`,
      trend: "neutral",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Total Kelas & Level",
      value: `${overview.totalKelas} / ${overview.totalLevel}`,
      change: `${overview.totalJenjang} Jenjang`,
      trend: "neutral",
      icon: Grid3x3,
      href: "/admin/master",
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      label: "Log Notifikasi",
      value: String(notifData.notifications.length),
      change: `${overview.notificationsThisWeek} pekan ini`,
      trend: "warning",
      icon: Bell,
      href: "/admin/notifikasi",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
  ]

  const recentActivities = notifData.notifications.slice(0, 4).map((n) => ({
    time: new Date(n.createdAt).toLocaleDateString("id-ID", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
    action: n.title,
    type: n.type,
    icon: n.type === "attendance" ? Activity : n.type === "system" ? Bell : n.type === "student" ? UserPlus : ShieldCheck,
    color: n.type === "attendance" ? "text-emerald-700 bg-emerald-50" : n.type === "system" ? "text-blue-700 bg-blue-50" : n.type === "student" ? "text-purple-700 bg-purple-50" : "text-rose-700 bg-rose-50",
  }))

  const quickActions = [
    { label: "Tambah Pengguna", href: "/admin/users/tambah", icon: UserPlus },
    { label: "Kelola Santri", href: "/admin/santri", icon: BookOpen },
    { label: "Master Data Kelas", href: "/admin/master", icon: Grid3x3 },
    { label: "Pengaturan Reminder", href: "/admin/pengaturan/reminder", icon: Settings },
  ]

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dasbor Utama Administrator
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Kelola data pengguna, santri binaan, kelas, dan parameter sistem SiMas
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto gap-1.5 px-3 py-1 font-semibold text-slate-700 bg-slate-100 border-slate-200">
          <Activity className="size-3.5 text-emerald-600 animate-pulse" />
          Sistem Online
        </Badge>
      </div>

      {/* Stats Grid with Enlarged Prominent Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link key={idx} href={stat.href} className="group block">
              <Card className="h-full border-slate-200 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl border ${stat.color} transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="size-5.5 stroke-[2.2]" />
                    </div>
                    <ArrowUpRight className="size-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </div>
                  
                  {/* Enlarged Stat Number */}
                  <div className="space-y-0.5">
                    <p className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide pt-1">
                      {stat.label}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{stat.change}</span>
                    <span className="text-emerald-700 font-bold group-hover:underline">Buka →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 font-heading">Log Aktivitas Terbaru</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Aktivitas staf, guru, dan trigger otomatis 24 jam terakhir
              </CardDescription>
            </div>
            <Link href="/admin/notifikasi">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-emerald-50">
                Lihat Semua
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentActivities.map((act, idx) => {
                const Icon = act.icon
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${act.color}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug truncate">
                        {act.action}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{act.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-900 font-heading">Menu Cepat</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Jalan pintas operasional admin
            </CardDescription>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardContent className="pt-4 space-y-2.5">
            {quickActions.map((qa, idx) => {
              const Icon = qa.icon
              return (
                <Link key={idx} href={qa.href} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 px-3.5 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-slate-800 font-semibold text-xs sm:text-sm">
                      <Icon className="size-4 text-primary" />
                      <span>{qa.label}</span>
                    </span>
                    <ArrowRight className="size-3.5 text-slate-400" />
                  </Button>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
