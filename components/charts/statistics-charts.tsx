"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsResult } from "@/lib/queries";

const PRIMARY = "hsl(var(--primary))";
const ACCENT = "hsl(var(--accent))";
const WARNING = "hsl(var(--warning))";
const DESTRUCTIVE = "hsl(var(--destructive))";
const GRID = "hsl(var(--border))";
const MUTED = "hsl(var(--muted-foreground))";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function AttendanceTrendChart({ data }: { data: StatsResult["charts"]["attendanceTrend"] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Kehadiran</CardTitle>
          <CardDescription>Persentase kehadiran 7 hari terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState label="Belum ada data absensi minggu ini" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Kehadiran</CardTitle>
        <CardDescription>Persentase kehadiran 7 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: MUTED }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d: string) =>
                  new Date(d).toLocaleDateString("id-ID", { weekday: "short", day: "numeric" })
                }
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: MUTED }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                cursor={{ stroke: GRID }}
                contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }}
                formatter={(value: any, _name, item) => [`${Number(value) ?? 0}%`, `Hadir (${item.payload.hadir}/${item.payload.total})`]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke={PRIMARY}
                strokeWidth={2.5}
                dot={{ fill: PRIMARY, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentsByClassChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Santri per Kelas</CardTitle>
          <CardDescription>Jumlah santri aktif per kelas</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState label="Belum ada data kelas" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Santri per Kelas</CardTitle>
        <CardDescription>Jumlah santri aktif per kelas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={90}
                tick={{ fontSize: 11, fill: MUTED }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }}
              />
              <Bar dataKey="value" name="Santri" fill={PRIMARY} radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function HafalanByClassChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setoran Hafalan per Kelas</CardTitle>
          <CardDescription>Jumlah setoran bulan berjalan</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState label="Belum ada setoran hafalan bulan ini" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setoran Hafalan per Kelas</CardTitle>
        <CardDescription>Jumlah setoran bulan berjalan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }}
              />
              <Bar dataKey="value" name="Setoran" fill={ACCENT} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const BEHAVIOR_LABELS: Record<string, string> = {
  positif: "Perilaku Positif",
  pelanggaran: "Pelanggaran",
};

export function BehaviorTrendChart({ data }: { data: { label: string; value: number }[] }) {
  const dataWithLabels = data.map((d) => ({
    ...d,
    label: BEHAVIOR_LABELS[d.label] ?? d.label,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perilaku Santri</CardTitle>
          <CardDescription>Positif vs pelanggaran bulan ini</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState label="Belum ada catatan perilaku bulan ini" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perilaku Santri</CardTitle>
        <CardDescription>Positif vs pelanggaran bulan ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithLabels}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
              >
                {dataWithLabels.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={entry.label === "Perilaku Positif" ? PRIMARY : DESTRUCTIVE}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }}
                formatter={(value: any, name) => [Number(value) ?? 0, name as string]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const CASE_LABELS: Record<string, string> = {
  open: "Terbuka",
  in_progress: "Berlangsung",
  resolved: "Selesai",
};

export function CasesByStatusChart({ data }: { data: { label: string; value: number }[] }) {
  const dataWithLabels = data.map((d) => ({ ...d, label: CASE_LABELS[d.label] ?? d.label }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Kasus</CardTitle>
          <CardDescription>Distribusi kasus而已</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState label="Belum ada kasus tercatat" />
        </CardContent>
      </Card>
    );
  }

  const colorFor: Record<string, string> = {
    Terbuka: WARNING,
    Berlangsung: PRIMARY,
    Selesai: ACCENT,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Kasus</CardTitle>
        <CardDescription>Distribusi kasus per status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithLabels}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
              >
                {dataWithLabels.map((entry) => (
                  <Cell key={entry.label} fill={colorFor[entry.label] ?? MUTED} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }}
                formatter={(value: any, name) => [Number(value) ?? 0, name as string]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
