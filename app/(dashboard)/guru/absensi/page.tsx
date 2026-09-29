"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, Calendar, CalendarRange, Check, Sparkles, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUSES = [
  { value: "hadir", label: "Hadir", short: "H", bg: "bg-emerald-600 hover:bg-emerald-700 text-white", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500" },
  { value: "terlambat", label: "Terlambat", short: "T", bg: "bg-amber-600 hover:bg-amber-700 text-white", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500" },
  { value: "sakit", label: "Sakit", short: "S", bg: "bg-blue-600 hover:bg-blue-700 text-white", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500" },
  { value: "izin", label: "Izin", short: "I", bg: "bg-purple-600 hover:bg-purple-700 text-white", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500" },
  { value: "alpha", label: "Alpha", short: "A", bg: "bg-rose-600 hover:bg-rose-700 text-white", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500" },
] as const;

type StatusValue = (typeof STATUSES)[number]["value"];

interface StudentRow {
  id: string;
  nis: string;
  full_name: string;
  class_name: string;
  halaqah_id: string | null;
  halaqah_name: string | null;
}

interface ExistingAttendance {
  id: string;
  student_id: string;
  date: string;
  status: StatusValue;
  notes?: string | null;
}

function getWeekRange(offsetWeeks = 0, weekdaysOnly = true) {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offsetWeeks * 7);

  const end = new Date(monday);
  end.setDate(monday.getDate() + (weekdaysOnly ? 4 : 6));

  return {
    start: monday.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function getDatesInRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const current = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  let count = 0;
  while (current <= end && count < 31) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
    count++;
  }
  return dates;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const dayName = DAY_NAMES[d.getDay()];
  const dayNum = d.getDate();
  const monthNum = d.getMonth() + 1;
  return { dayName, formatted: `${dayName}, ${dayNum}/${monthNum}` };
}

export default function GuruAbsensiPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];
  const currentWeek = useMemo(() => getWeekRange(0, true), []);

  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(currentWeek.start);
  const [endDate, setEndDate] = useState(currentWeek.end);
  const [halaqahId, setHalaqahId] = useState<string>("all");

  const [students, setStudents] = useState<StudentRow[]>([]);
  // Daily attendance: studentId -> status
  const [dailyAttendance, setDailyAttendance] = useState<Record<string, StatusValue>>({});
  // Range attendance: studentId -> date -> status
  const [rangeAttendance, setRangeAttendance] = useState<Record<string, Record<string, StatusValue>>>({});

  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected students for bulk update in weekly mode
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<StatusValue>("hadir");

  // Load students
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (halaqahId !== "all") params.set("halaqahId", halaqahId);
      const res = await fetch(`/api/santri?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch {
      setError("Gagal memuat data santri");
    } finally {
      setLoading(false);
    }
  }, [halaqahId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Load existing attendance for Daily mode
  const loadDailyAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      if (res.ok) {
        const records: ExistingAttendance[] = await res.json();
        const map: Record<string, StatusValue> = {};
        records.forEach((r) => {
          map[r.student_id] = r.status;
        });
        setDailyAttendance(map);
      }
    } catch (err) {
      console.error("Error loading daily attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }
  }, [date]);

  // Load existing attendance for Range/Weekly mode
  const loadRangeAttendance = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/attendance?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const records: ExistingAttendance[] = await res.json();
        const map: Record<string, Record<string, StatusValue>> = {};
        records.forEach((r) => {
          if (!map[r.student_id]) map[r.student_id] = {};
          map[r.student_id][r.date] = r.status;
        });
        setRangeAttendance(map);
      }
    } catch (err) {
      console.error("Error loading range attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setSavedMessage(null);
    if (mode === "daily") {
      loadDailyAttendance();
    } else {
      loadRangeAttendance();
    }
  }, [mode, date, startDate, endDate, loadDailyAttendance, loadRangeAttendance]);

  // Distinct Levels (Halaqahs) from loaded students
  const levels = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => {
      if (s.halaqah_id && s.halaqah_name) map.set(s.halaqah_id, s.halaqah_name);
    });
    return Array.from(map.entries());
  }, [students]);

  // Dates in selected range
  const datesInRange = useMemo(() => {
    if (!startDate || !endDate) return [];
    return getDatesInRange(startDate, endDate);
  }, [startDate, endDate]);

  // Mark all present in Daily mode
  const markAllDailyPresent = () => {
    const next: Record<string, StatusValue> = {};
    students.forEach((s) => {
      next[s.id] = "hadir";
    });
    setDailyAttendance(next);
  };

  // Mark all present for all days in Range mode
  const markAllRangePresent = () => {
    const next = { ...rangeAttendance };
    students.forEach((s) => {
      if (!next[s.id]) next[s.id] = {};
      datesInRange.forEach((d) => {
        next[s.id][d] = "hadir";
      });
    });
    setRangeAttendance(next);
    toast.success("Semua santri ditandai hadir untuk seluruh tanggal di rentang ini");
  };

  // Mark a specific student present for all days in Range mode
  const markStudentAllDays = (studentId: string, status: StatusValue = "hadir") => {
    setRangeAttendance((prev) => {
      const nextStudent = { ...(prev[studentId] || {}) };
      datesInRange.forEach((d) => {
        nextStudent[d] = status;
      });
      return { ...prev, [studentId]: nextStudent };
    });
  };

  // Set single cell status in Range mode
  const setRangeCellStatus = (studentId: string, dateStr: string, status: StatusValue) => {
    setRangeAttendance((prev) => {
      const studentMap = { ...(prev[studentId] || {}) };
      if (studentMap[dateStr] === status) {
        delete studentMap[dateStr];
      } else {
        studentMap[dateStr] = status;
      }
      return { ...prev, [studentId]: studentMap };
    });
  };

  // Apply bulk status to selected students for all dates in range
  const applyBulkStatus = () => {
    if (selectedStudentIds.length === 0) {
      toast.error("Pilih minimal satu santri untuk menerapkan status");
      return;
    }

    setRangeAttendance((prev) => {
      const next = { ...prev };
      selectedStudentIds.forEach((sId) => {
        if (!next[sId]) next[sId] = {};
        datesInRange.forEach((d) => {
          next[sId][d] = bulkStatus;
        });
      });
      return next;
    });

    toast.success(`Berhasil menerapkan status "${bulkStatus}" untuk ${selectedStudentIds.length} santri`);
  };

  // Preset handlers for quick date range selection
  const applyPreset = (preset: "thisWeekWorkdays" | "thisWeekFull" | "lastWeek" | "last7Days") => {
    if (preset === "thisWeekWorkdays") {
      const r = getWeekRange(0, true);
      setStartDate(r.start);
      setEndDate(r.end);
    } else if (preset === "thisWeekFull") {
      const r = getWeekRange(0, false);
      setStartDate(r.start);
      setEndDate(r.end);
    } else if (preset === "lastWeek") {
      const r = getWeekRange(-1, true);
      setStartDate(r.start);
      setEndDate(r.end);
    } else if (preset === "last7Days") {
      const endD = new Date();
      const startD = new Date();
      startD.setDate(endD.getDate() - 6);
      setStartDate(startD.toISOString().split("T")[0]);
      setEndDate(endD.toISOString().split("T")[0]);
    }
  };

  // Save Daily Attendance
  const handleSaveDaily = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setError("Sesi login tidak valid. Silakan login ulang.");
      return;
    }

    const entries = Object.entries(dailyAttendance);
    if (entries.length === 0) {
      toast.error("Belum ada santri yang ditandai");
      return;
    }

    setSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const records = entries.map(([studentId, status]) => ({
        studentId,
        userId,
        date,
        status,
        halaqahId: students.find((s) => s.id === studentId)?.halaqah_id ?? null,
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan absensi");
      }

      toast.success(data.message || "Absensi harian berhasil disimpan");
      setSavedMessage(`Absensi harian tanggal ${date} (${records.length} santri) berhasil disimpan.`);
      await loadDailyAttendance();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan absensi");
      toast.error(err.message || "Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  // Save Range Attendance (Weekly / Date Range)
  const handleSaveRange = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setError("Sesi login tidak valid. Silakan login ulang.");
      return;
    }

    const records: Array<{
      studentId: string;
      userId: string;
      date: string;
      status: StatusValue;
      halaqahId: string | null;
    }> = [];

    Object.entries(rangeAttendance).forEach(([studentId, datesMap]) => {
      const student = students.find((s) => s.id === studentId);
      Object.entries(datesMap).forEach(([dateStr, status]) => {
        records.push({
          studentId,
          userId,
          date: dateStr,
          status,
          halaqahId: student?.halaqah_id ?? null,
        });
      });
    });

    if (records.length === 0) {
      toast.error("Belum ada data kehadiran yang diisi dalam rentang tanggal");
      return;
    }

    setSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan absensi rentang tanggal");
      }

      toast.success(data.message || "Absensi sepekan berhasil disimpan");
      setSavedMessage(
        `Absensi sepekan (${startDate} s/d ${endDate}) berhasil disimpan: ${records.length} data kehadiran tercatat.`
      );
      await loadRangeAttendance();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan absensi");
      toast.error(err.message || "Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  // Count marked in daily
  const dailyMarkedCount = Object.keys(dailyAttendance).length;

  // Count total marked cells in range
  const rangeMarkedCount = useMemo(() => {
    let count = 0;
    Object.values(rangeAttendance).forEach((m) => {
      count += Object.keys(m).length;
    });
    return count;
  }, [rangeAttendance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Absensi Santri</h1>
          <p className="text-muted-foreground mt-1">
            Input absensi santri harian atau perbarui absensi dalam rentang tanggal (mingguan)
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-muted p-1 rounded-lg border w-fit">
          <Button
            type="button"
            variant={mode === "daily" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("daily")}
            className="text-xs gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Harian (1 Hari)
          </Button>
          <Button
            type="button"
            variant={mode === "weekly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("weekly")}
            className="text-xs gap-1.5"
          >
            <CalendarRange className="h-4 w-4" />
            Rentang Tanggal / Pekanan
          </Button>
        </div>
      </div>

      {/* Filter & Date Selection Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {mode === "daily" ? "Pengaturan Tanggal & Level" : "Pilihan Rentang Tanggal Absensi (Pekanan)"}
          </CardTitle>
          <CardDescription>
            {mode === "daily"
              ? "Pilih tanggal dan filter level untuk input absensi harian santri."
              : "Tentukan rentang tanggal (misalnya Senin - Jumat) untuk mengisi atau mengupdate absensi mingguan sekaligus."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "daily" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal Absensi</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="levelSelect">Filter Level</Label>
                <Select value={halaqahId} onValueChange={setHalaqahId}>
                  <SelectTrigger id="levelSelect">
                    <SelectValue placeholder="Semua Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Level</SelectItem>
                    {levels.map(([id, name]) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Selesai</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="levelSelectWeekly">Filter Level</Label>
                  <Select value={halaqahId} onValueChange={setHalaqahId}>
                    <SelectTrigger id="levelSelectWeekly">
                      <SelectValue placeholder="Semua Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Level</SelectItem>
                      {levels.map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs">
                <span className="text-muted-foreground font-medium">Jalan Pintas Pekan:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applyPreset("thisWeekWorkdays")}
                >
                  Pekan Ini (Senin - Jumat)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applyPreset("thisWeekFull")}
                >
                  Pekan Ini (Senin - Ahad)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applyPreset("lastWeek")}
                >
                  Pekan Lalu (Senin - Jumat)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applyPreset("last7Days")}
                >
                  7 Hari Terakhir
                </Button>

                <Badge variant="secondary" className="ml-auto text-xs">
                  {datesInRange.length} Hari dalam Rentang
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODE 1: DAILY ATTENDANCE */}
      {mode === "daily" && (
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Santri ({date})</CardTitle>
              <CardDescription>
                {dailyMarkedCount} dari {students.length} santri ditandai
                {loadingAttendance && " · Memuat data tersimpan..."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllDailyPresent}
                disabled={students.length === 0}
              >
                <Check className="mr-1.5 h-4 w-4" />
                Tandai Semua Hadir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Memuat data santri...</span>
              </div>
            ) : students.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                Tidak ada santri untuk filter level yang dipilih.
              </p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    dailyAttendance[student.id] && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-foreground">{student.full_name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono">{student.nis}</span>
                      <span>·</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        {student.class_name}
                      </Badge>
                      {student.halaqah_name && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                          {student.halaqah_name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {STATUSES.map((status) => {
                      const isSelected = dailyAttendance[student.id] === status.value;
                      return (
                        <Button
                          key={status.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "text-xs h-8 px-2.5",
                            isSelected && status.bg
                          )}
                          onClick={() =>
                            setDailyAttendance((prev) => ({
                              ...prev,
                              [student.id]: isSelected ? ("" as any) : status.value,
                            }))
                          }
                        >
                          {status.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* MODE 2: WEEKLY / RANGE ATTENDANCE (MATRIKS PEKANAN) */}
      {mode === "weekly" && (
        <div className="space-y-4">
          {/* Bulk Update Controls */}
          <Card className="bg-muted/30">
            <CardHeader className="py-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Update Massal Rentang Tanggal</span>
                  <span className="text-xs text-muted-foreground">
                    (Terapkan status sekaligus untuk seluruh hari)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      if (selectedStudentIds.length === students.length) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(students.map((s) => s.id));
                      }
                    }}
                  >
                    {selectedStudentIds.length === students.length ? "Batal Pilih Semua" : "Pilih Semua Santri"}
                  </Button>

                  <div className="w-32">
                    <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as StatusValue)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={applyBulkStatus}
                    disabled={selectedStudentIds.length === 0}
                  >
                    Terapkan ke {selectedStudentIds.length} Santri
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={markAllRangePresent}
                  >
                    Tandai Semua Hadir di Seluruh Hari
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Interactive Attendance Grid */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Matriks Kehadiran Santri ({startDate} s/d {endDate})
                  </CardTitle>
                  <CardDescription>
                    {rangeMarkedCount} data kehadiran ditandai · Klik tombol status di tiap kolom tanggal untuk mengubah
                    {loadingAttendance && " · Mengambil data..."}
                  </CardDescription>
                </div>
                {/* Status Legend */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {STATUSES.map((s) => (
                    <div key={s.value} className="flex items-center gap-1">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", s.bg)}>
                        {s.short}
                      </span>
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Memuat santri...</span>
                </div>
              ) : students.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  Tidak ada santri untuk filter yang dipilih.
                </p>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/70 text-muted-foreground uppercase text-[11px] border-b">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.length === students.length && students.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudentIds(students.map((s) => s.id));
                              else setSelectedStudentIds([]);
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="p-3 min-w-[180px]">Nama Santri</th>
                        <th className="p-3 min-w-[100px]">Level</th>
                        {datesInRange.map((d) => {
                          const { dayName, formatted } = formatDayLabel(d);
                          return (
                            <th key={d} className="p-2 text-center min-w-[85px] border-l">
                              <div className="font-semibold text-foreground">{dayName}</div>
                              <div className="text-[10px] font-normal text-muted-foreground">{d.slice(5)}</div>
                            </th>
                          );
                        })}
                        <th className="p-3 text-center min-w-[110px] border-l">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map((student) => {
                        const isSelected = selectedStudentIds.includes(student.id);
                        const studentDates = rangeAttendance[student.id] || {};

                        return (
                          <tr
                            key={student.id}
                            className={cn(
                              "hover:bg-muted/40 transition-colors",
                              isSelected && "bg-primary/5"
                            )}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds([...selectedStudentIds, student.id]);
                                  } else {
                                    setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                                  }
                                }}
                                className="rounded"
                              />
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-foreground">{student.full_name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{student.nis}</p>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {student.halaqah_name || student.class_name}
                              </Badge>
                            </td>

                            {datesInRange.map((d) => {
                              const currentStatus = studentDates[d];
                              const statusObj = STATUSES.find((s) => s.value === currentStatus);

                              return (
                                <td key={d} className="p-1.5 text-center border-l">
                                  <div className="inline-flex rounded-md shadow-xs" role="group">
                                    {STATUSES.map((s) => {
                                      const active = currentStatus === s.value;
                                      return (
                                        <button
                                          key={s.value}
                                          type="button"
                                          onClick={() => setRangeCellStatus(student.id, d, s.value)}
                                          title={`${student.full_name} - ${d} - ${s.label}`}
                                          className={cn(
                                            "w-5 h-7 text-[10px] font-bold border first:rounded-l last:rounded-r transition-all",
                                            active
                                              ? cn(s.bg, "ring-1 ring-offset-1")
                                              : "bg-background text-muted-foreground/70 hover:bg-muted"
                                          )}
                                        >
                                          {s.short}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>
                              );
                            })}

                            <td className="p-3 text-center border-l">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] px-2 text-primary hover:bg-primary/10"
                                onClick={() => markStudentAllDays(student.id, "hadir")}
                              >
                                Set Hadir Sepekan
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {savedMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {mode === "daily" ? (
          <>
            <Button onClick={handleSaveDaily} disabled={saving || dailyMarkedCount === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Absensi Harian ({dailyMarkedCount} Santri)
            </Button>
            <Button
              variant="outline"
              onClick={() => setDailyAttendance({})}
              disabled={saving || dailyMarkedCount === 0}
            >
              Reset
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleSaveRange} disabled={saving || rangeMarkedCount === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Absensi Pekanan ({rangeMarkedCount} Data Terisi)
            </Button>
            <Button
              variant="outline"
              onClick={() => setRangeAttendance({})}
              disabled={saving || rangeMarkedCount === 0}
            >
              Reset Matriks
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
