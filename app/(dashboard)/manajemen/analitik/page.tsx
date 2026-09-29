import { Suspense } from "react";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceTrendChart, StudentsByClassChart, HafalanByClassChart, BehaviorTrendChart, CasesByStatusChart } from "@/components/charts/statistics-charts";
import { getStats, StatsResult } from "@/lib/queries";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-secondary">{value}</p>
    </Card>
  );
}

async function AnalitikCharts() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as "admin" | "guru" | "manajemen" | undefined;

  const stats: StatsResult = await getStats(userId, role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Statistik & Analitik</h1>
        <p className="text-muted-foreground mt-1">Grafik dan statistik detail per kelas/angkatan</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Santri" value={stats.overview.totalStudents} />
        <StatCard label="Kehadiran Rata-rata" value={`${stats.overview.attendancePct}%`} />
        <StatCard label="Kasus Aktif" value={stats.overview.activeCases} />
        <StatCard label="Guru Terdaftar" value={stats.overview.totalGuru} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AttendanceTrendChart data={stats.charts.attendanceTrend} />
        <HafalanByClassChart data={stats.charts.hafalanByClass} />
        <BehaviorTrendChart data={stats.charts.behaviorTrend} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StudentsByClassChart data={stats.charts.studentsByClass} />
        <CasesByStatusChart data={stats.charts.casesByStatus} />
      </div>

      {stats.guruStats && (
        <div className="border-t pt-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Statistik Khusus Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Santri Bimbingan" value={stats.guruStats.myStudents} />
            <StatCard label="Kehadiran Mingguan" value={`${stats.guruStats.myAttendancePct}%`} />
            <StatCard label="Kasus Aktif" value={stats.guruStats.myActiveCases} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManajemenAnalitikPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Memuat analitik...</div>}>
      <AnalitikCharts />
    </Suspense>
  );
}