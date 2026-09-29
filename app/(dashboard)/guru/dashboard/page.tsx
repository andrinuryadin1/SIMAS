import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Calendar, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ClipboardList, 
  Sparkles,
  ChevronRight,
  BookCheck,
  UserCheck
} from "lucide-react";
import Link from "next/link";

export default function GuruDashboard() {
  const stats = [
    { 
      label: "Santri Halaqah Saya", 
      value: "12", 
      desc: "Santri aktif terdaftar", 
      icon: Users,
      trend: "Halaqah Abu Bakar",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200" 
    },
    { 
      label: "Absensi Hari Ini", 
      value: "Perlu Input", 
      desc: "Sesi halaqah pagi & sore", 
      icon: Calendar, 
      color: "text-amber-700 bg-amber-50 border-amber-200",
      urgent: true 
    },
    { 
      label: "Hafalan Tercatat", 
      value: "156 Juz", 
      desc: "+14 juz bulan ini", 
      icon: BookOpen,
      trend: "+9.2%",
      color: "text-blue-700 bg-blue-50 border-blue-200" 
    },
    { 
      label: "Tugas Tertunda", 
      value: "3", 
      desc: "Perlu ditindaklanjuti", 
      icon: AlertCircle, 
      color: "text-rose-700 bg-rose-50 border-rose-200",
      urgent: true 
    },
  ];

  const todoList = [
    { 
      task: "Input absensi halaqah sore hari ini (Halaqah Abu Bakar)", 
      completed: false, 
      dueTime: "Hari ini, 16:00",
      category: "Absensi",
      badgeVariant: "destructive" as const
    },
    { 
      task: "Catat perkembangan hafalan Surat Al-Kahf (5 santri)", 
      completed: false, 
      dueTime: "Hari ini, 18:00",
      category: "Hafalan",
      badgeVariant: "warning" as const
    },
    { 
      task: "Input penilaian adab & kedisiplinan pekan ke-3", 
      completed: false, 
      dueTime: "Kamis, 28 Sep",
      category: "Adab",
      badgeVariant: "outline" as const
    },
    { 
      task: "Menulis jurnal mengajar materi Tajwid Makhorijul Huruf", 
      completed: true, 
      dueTime: "Selesai kemarin",
      category: "Jurnal",
      badgeVariant: "secondary" as const
    },
  ];

  const upcomingReminders = [
    { 
      day: "Kamis, 28 Sep 2026", 
      time: "14:00 WIB", 
      title: "Rekap Perkembangan Santri",
      message: "Batas akhir input evaluasi mingguan capaian hafalan dan kedisiplinan santri halaqah." 
    },
    { 
      day: "Sabtu, 30 Sep 2026", 
      time: "08:30 WIB", 
      title: "Rapat Evaluasi Guru & Halaqah",
      message: "Koordinasi bulanan bersama jajaran pengasuh dan manajemen pondok." 
    },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
              <Sparkles className="size-3.5" />
              <span>Portal Pembina Halaqah</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Assalamu'alaikum, Ustadz Rizki
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 max-w-xl">
              Berikut ringkasan halaqah Anda hari ini. Pastikan seluruh absensi dan capaian hafalan santri tercatat tepat waktu.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/guru/absensi">
              <Button size="lg" className="shadow-sm font-bold">
                <UserCheck className="size-4" />
                Input Presensi
              </Button>
            </Link>
            <Link href="/guru/hafalan">
              <Button variant="outline" size="lg" className="border-slate-300 font-bold hover:bg-slate-100 text-slate-800">
                <BookCheck className="size-4" />
                Setoran Hafalan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid with Enlarged Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={idx} 
              className="group relative overflow-hidden transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 border-slate-200 bg-white"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`size-11 rounded-xl flex items-center justify-center border transition-all group-hover:scale-105 duration-200 ${stat.color}`}>
                    <Icon className="size-5.5 stroke-[2.2]" />
                  </div>
                  {stat.trend && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {stat.trend}
                    </span>
                  )}
                </div>

                {/* Enlarged Stat Number */}
                <div className="space-y-0.5">
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide pt-1">
                    {stat.label}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-medium pt-3 border-t border-slate-100">
                  <span className="text-slate-500">{stat.desc}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Todo List & Agenda */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 font-heading">Tugas & Agenda Hari Ini</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Daftar input dan tanggung jawab yang perlu diselesaikan
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border-slate-200">
              1 Selesai / 4 Total
            </Badge>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardContent className="pt-4">
            <div className="space-y-3">
              {todoList.map((todo, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150 ${
                    todo.completed 
                      ? "bg-slate-50/70 border-slate-200 opacity-60" 
                      : "bg-white border-slate-200 hover:bg-slate-50/80 hover:border-emerald-300 shadow-xs"
                  }`}
                >
                  <div className={`size-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    todo.completed ? "bg-primary border-primary text-white" : "border-slate-300 hover:border-primary"
                  }`}>
                    {todo.completed && <CheckCircle2 className="size-4 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-2 py-0 h-4.5 font-bold border-slate-300 text-slate-700">
                        {todo.category}
                      </Badge>
                      <p className={`text-sm font-semibold truncate ${
                        todo.completed ? "line-through text-slate-400" : "text-slate-800"
                      }`}>
                        {todo.task}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <Clock className="size-3 text-slate-400" />
                      {todo.dueTime}
                    </p>
                  </div>
                  {!todo.completed && (
                    <Button variant="ghost" size="xs" className="shrink-0 gap-1 text-emerald-700 font-bold hover:bg-emerald-50">
                      <span>Proses</span>
                      <ChevronRight className="size-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Reminders */}
        <div className="space-y-6">
          {/* Upcoming Reminders */}
          <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-amber-700" />
                <CardTitle className="text-base font-bold text-slate-900 font-heading">Reminder Akademik</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.map((reminder, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-amber-200/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold tracking-wider text-amber-700 uppercase">
                      {reminder.day}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono font-medium">{reminder.time}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{reminder.title}</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{reminder.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" />
                <CardTitle className="text-base font-bold text-slate-900 font-heading">Menu Cepat</CardTitle>
              </div>
            </CardHeader>
            <Separator className="bg-slate-100" />
            <CardContent className="pt-3 space-y-2">
              <Link href="/guru/absensi" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50" size="sm">
                  <span className="flex items-center gap-2.5 font-semibold text-slate-800 text-xs sm:text-sm">
                    <Calendar className="size-4 text-primary" />
                    <span>Presensi Halaqah</span>
                  </span>
                  <ArrowUpRight className="size-4 text-slate-400" />
                </Button>
              </Link>
              <Link href="/guru/hafalan" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50" size="sm">
                  <span className="flex items-center gap-2.5 font-semibold text-slate-800 text-xs sm:text-sm">
                    <BookOpen className="size-4 text-primary" />
                    <span>Input Setoran Tahfidz</span>
                  </span>
                  <ArrowUpRight className="size-4 text-slate-400" />
                </Button>
              </Link>
              <Link href="/guru/santri" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50" size="sm">
                  <span className="flex items-center gap-2.5 font-semibold text-slate-800 text-xs sm:text-sm">
                    <Users className="size-4 text-primary" />
                    <span>Daftar Santri Binaan</span>
                  </span>
                  <ArrowUpRight className="size-4 text-slate-400" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
