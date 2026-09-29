import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  BarChart3,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

export const metadata: Metadata = {
  title: "SiMas - Sistem Informasi Manajemen Santri | Kuttab Al-Fatih Bandung",
  description:
    "Platform digital terpusat untuk merekam dan menyajikan rekam jejak lengkap setiap santri Kuttab Al-Fatih Bandung - Tahfidz, Adab, Berhitung, Calistung, Absensi, dan Riwayat Khusus.",
  keywords: [
    "SiMas",
    "Kuttab Al-Fatih",
    "Sistem Informasi Santri",
    "Tahfidz",
    "Adab",
    "Bandung",
    "Manajemen Santri",
  ],
  openGraph: {
    title: "SiMas - Sistem Informasi Manajemen Santri",
    description:
      "Platform digital terpusat rekam jejak tumbuh kembang santri Kuttab Al-Fatih Bandung",
    type: "website",
  },
};

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Rekam Jejak 360° Santri",
      description:
        "Profil lengkap santri mencakup identitas, absensi, hafalan Qur'an, perkembangan berhitung & calistung, adab & akhlak, hingga catatan kasus khusus — semua dalam satu tampilan.",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Admin mengelola sistem, Guru input data harian, Manajemen memantau dan menganalisis — setiap role memiliki akses sesuai kebutuhan.",
      color: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      icon: BarChart3,
      title: "Dashboard & Analitik",
      description:
        "Statistik visual per kelas, angkatan, dan santri. Grafik tren hafalan, distribusi nilai adab, dan persentase kehadiran dalam satu klik.",
      color: "text-purple-700 bg-purple-50 border-purple-200"
    },
    {
      icon: Shield,
      title: "Keamanan & Audit Trail",
      description:
        "Setiap perubahan data tercatat otomatis. Autentikasi aman dengan validasi role dan enkripsi data terjamin.",
      color: "text-teal-700 bg-teal-50 border-teal-200"
    },
    {
      icon: Clock,
      title: "Reminder Otomatis",
      description:
        "Notifikasi mingguan ke Guru untuk melengkapi input. Alert otomatis untuk absensi alpha berulang dan pelanggaran berat.",
      color: "text-amber-700 bg-amber-50 border-amber-200"
    },
    {
      icon: FileText,
      title: "Export Laporan PDF/Excel",
      description:
        "Generate laporan rekam jejak santri, laporan kelas, dan analitik dalam format PDF atau Excel siap cetak.",
      color: "text-rose-700 bg-rose-50 border-rose-200"
    },
  ];

  const benefits = [
    {
      icon: CheckCircle2,
      text: "Data santri terpusat dan terstruktur aman",
    },
    {
      icon: CheckCircle2,
      text: "Visibilitas real-time perkembangan capaian hafalan",
    },
    {
      icon: CheckCircle2,
      text: "Riwayat khusus & pendampingan terdokumentasi rapi",
    },
    {
      icon: CheckCircle2,
      text: "Laporan evaluasi berkala otomatis siap unduh",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50/50 to-white py-16 md:py-24 border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            
            {/* Official Logo Banner in Hero */}
            <div className="flex justify-center mb-2">
              <div className="relative h-20 w-48 sm:h-24 sm:w-56 drop-shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Kuttab Al-Fatih Bandung Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs">
              <Sparkles className="size-3.5" />
              <span>Sistem Informasi Manajemen Santri (SiMas)</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Rekam Jejak Tumbuh Kembang Santri Terpadu
              </h1>
              <p className="font-heading font-semibold text-base sm:text-xl text-emerald-800">
                Kuttab Al-Fatih Bandung — Gemilang di Usia Belia
              </p>
            </div>

            <p className="mx-auto max-w-2xl leading-relaxed text-sm sm:text-base text-slate-600 font-medium">
              SiMas merekam dan menyajikan rekam jejak lengkap setiap santri —
              mulai dari identitas, absensi, hafalan Qur'an, perkembangan
              berhitung, calistung, adab & akhlak, hingga catatan kasus khusus
              — sehingga pimpinan & pengasuh dapat menilai tumbuh kembang santri{" "}
              <span className="font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-4">
                dalam satu klik saja
              </span>
              .
            </p>

            <div className="flex flex-col gap-3 justify-center pt-2 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-11 px-7 font-bold shadow-md shadow-emerald-700/20 text-sm sm:text-base">
                  Masuk ke SiMas
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
              <a href="#fitur">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-7 font-bold border-slate-300 text-slate-800 hover:bg-slate-100 text-sm sm:text-base"
                >
                  Lihat Fitur Utama
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-slate-50/80 py-14 md:py-18 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Keuntungan Menggunakan SiMas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-colors"
                >
                  <CardContent className="flex items-center gap-3.5 p-5">
                    <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <benefit.icon className="size-5 text-emerald-700 stroke-[2.5]" />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-800">{benefit.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Keunggulan Sistem SiMas
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Fitur lengkap yang dirancang khusus untuk kebutuhan ekosistem pendidikan Kuttab Al-Fatih Bandung
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden border-slate-200 bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-200">
                <CardContent className="space-y-3.5 p-6">
                  <div className={`flex size-12 items-center justify-center rounded-xl border ${feature.color}`}>
                    <feature.icon className="size-6 stroke-[2.2]" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-sm text-slate-600 font-medium">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 py-16 text-white md:py-20 shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="flex justify-center mb-1">
              <div className="relative h-16 w-44 rounded-xl bg-white/95 p-2 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Kuttab Al-Fatih Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Siap Meningkatkan Pengelolaan Data Santri?
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-emerald-100/90 font-medium leading-relaxed">
              Akses penuh ke rekam jejak santri, monitoring halaqah real-time, dan
              laporan terstruktur dalam satu platform terpadu.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button size="lg" className="h-11 px-8 font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg text-sm sm:text-base">
                  Masuk ke SiMas Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
