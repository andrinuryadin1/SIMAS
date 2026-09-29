import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  BarChart3, 
  ArrowUpRight, 
  GraduationCap, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function ManajemenDashboard() {
  const stats = [
    { 
      label: "Total Santri Aktif", 
      value: "87", 
      desc: "3 Kelas / Halaqah", 
      icon: Users, 
      href: "/manajemen/santri",
      trend: "+4 santri baru",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    { 
      label: "Rata-rata Kehadiran", 
      value: "94.2%", 
      desc: "Bulan berjalan", 
      icon: TrendingUp, 
      href: "/manajemen/analitik",
      trend: "+1.8%",
      color: "text-blue-700 bg-blue-50 border-blue-200"
    },
    { 
      label: "Kasus Khusus Terbuka", 
      value: "4", 
      desc: "Perhatian BK / Wali Kelas", 
      icon: AlertCircle, 
      href: "/manajemen/kasus",
      urgent: true,
      color: "text-rose-700 bg-rose-50 border-rose-200"
    },
    { 
      label: "Akumulasi Hafalan", 
      value: "156 Juz", 
      desc: "Target tahun ini 200 Juz", 
      icon: BarChart3, 
      href: "/manajemen/analitik",
      trend: "78% target",
      color: "text-amber-700 bg-amber-50 border-amber-200"
    },
  ];

  const casesSummary = [
    { title: "Absensi Berkepanjangan", count: 2, status: "in_progress", priority: "high", desc: "Santri tidak hadir > 3 hari berturut" },
    { title: "Sakit Berkepanjangan", count: 1, status: "in_progress", priority: "medium", desc: "Dalam perawatan rawat inap / istirahat" },
    { title: "Konseling & Masalah Keluarga", count: 1, status: "open", priority: "medium", desc: "Permintaan koordinasi wali santri" },
  ];

  const classStats = [
    { 
      name: "Umar bin Khattab (Kelas 7A)", 
      santri: 28, 
      avg_attendance: "95.5%", 
      avg_hafalan: "12 juz",
      attendanceVal: 95.5,
      guru: "Ust. Abdullah" 
    },
    { 
      name: "Abu Bakar As-Siddiq (Kelas 8B)", 
      santri: 29, 
      avg_attendance: "93.0%", 
      avg_hafalan: "10 juz",
      attendanceVal: 93.0,
      guru: "Ust. Rizki Firmansyah" 
    },
    { 
      name: "Usman bin Affan (Kelas 9C)", 
      santri: 30, 
      avg_attendance: "94.2%", 
      avg_hafalan: "11 juz",
      attendanceVal: 94.2,
      guru: "Ust. Farhan" 
    },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
              <Building2 className="size-3.5" />
              <span>Portal Manajemen & Pimpinan Pesantren</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dasbor Eksekutif SIMAS
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 max-w-2xl">
              Ikhtisar operasional, performa akademik santri, kinerja staf pengajar, dan tindak lanjut kasus harian.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/manajemen/laporan">
              <Button variant="outline" size="lg" className="border-slate-300 font-bold hover:bg-slate-100 text-slate-800">
                <FileText className="size-4" />
                Rekap Laporan
              </Button>
            </Link>
            <Link href="/manajemen/analitik">
              <Button size="lg" className="shadow-sm font-bold">
                <Activity className="size-4" />
                Analitik Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid with Enlarged Prominent Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href} className="group block">
              <Card className="h-full border-slate-200 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`size-11 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 ${stat.color}`}>
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
                    <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                      Lihat <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases Summary */}
        <Card className="lg:col-span-1 border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 font-heading">Kasus Khusus Santri</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Perlu pemantauan wali kelas & BK
              </CardDescription>
            </div>
            <Badge variant="destructive" className="font-mono text-xs font-bold bg-rose-600 text-white">
              4 Aktif
            </Badge>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardContent className="pt-4 space-y-3">
            {casesSummary.map((caseItem, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">{caseItem.title}</p>
                  <Badge 
                    className={caseItem.priority === "high" ? "bg-rose-100 text-rose-800 border-rose-200 font-bold text-[10px]" : "bg-amber-100 text-amber-800 border-amber-200 font-bold text-[10px]"}
                    variant="outline"
                  >
                    {caseItem.count} Kasus
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">{caseItem.desc}</p>
                <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100 mt-2">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-slate-700 capitalize">
                    {caseItem.status === "in_progress" ? "Sedang Ditangani" : "Belum Ditangani"}
                  </span>
                </div>
              </div>
            ))}

            <Link href="/manajemen/kasus" className="block pt-2">
              <Button variant="outline" className="w-full justify-between h-9 text-xs font-bold border-slate-200 hover:bg-slate-100 text-slate-800" size="sm">
                <span>Kelola Seluruh Kasus</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Class Statistics */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 font-heading">Statistik Capaian Per Halaqah</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Tingkat kehadiran, rata-rata hafalan, dan wali kelas binaan
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border-slate-200">
              3 Kelas
            </Badge>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardContent className="pt-4 space-y-3.5">
            {classStats.map((cls, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/50 transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <p className="font-heading font-bold text-sm text-slate-900">{cls.name}</p>
                    <p className="text-xs font-medium text-slate-500">Pembina: {cls.guru}</p>
                  </div>
                  <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs font-bold border-slate-300 text-slate-700">
                    {cls.santri} Santri
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Presensi Rata-rata</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{cls.avg_attendance}</span>
                      <div className="flex-1 max-w-[80px] bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${cls.attendanceVal}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Capaian Rata-rata</p>
                    <p className="font-bold text-slate-900 text-sm">{cls.avg_hafalan}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                    <Link href={`/manajemen/santri?class=${encodeURIComponent(cls.name)}`}>
                      <Button variant="ghost" size="xs" className="gap-1 text-primary font-bold hover:bg-emerald-50">
                        <span>Lihat Santri</span>
                        <ChevronRightIcon className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Bar */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 font-heading">Aksi & Navigasi Cepat Manajemen</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">
            Akses langsung modul administrasi dan pelaporan
          </CardDescription>
        </CardHeader>
        <Separator className="bg-slate-100" />
        <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/manajemen/santri" className="block">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50">
              <Users className="size-4 text-primary" />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">Buku Induk</span>
            </Button>
          </Link>
          <Link href="/manajemen/analitik" className="block">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50">
              <BarChart3 className="size-4 text-primary" />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">Analitik Kinerja</span>
            </Button>
          </Link>
          <Link href="/manajemen/guru" className="block">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50">
              <GraduationCap className="size-4 text-primary" />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">Monitoring Guru</span>
            </Button>
          </Link>
          <Link href="/manajemen/laporan" className="block">
            <Button variant="outline" className="w-full justify-start gap-2.5 h-11 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50">
              <FileText className="size-4 text-primary" />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">Ekspor Laporan</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function ChevronRightIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
