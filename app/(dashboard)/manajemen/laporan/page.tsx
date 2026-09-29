"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Loader2,
  FileText,
  Sheet,
  User,
  Users,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Option {
  value: string;
  label: string;
}

// Jenis loading kebutuhan lacak tombol mana yang aktif
type LoadingKey = `${"santri" | "kelas" | "analitik"}-${"pdf" | "xlsx"}` | null;

export default function ManajemenLaporanPage() {
  const [students, setStudents] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [loading, setLoading] = useState<LoadingKey>(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/santri?status=aktif");
      if (!res.ok) throw new Error();
      const list = await res.json();
      setStudents(
        list.map((s: any) => ({ value: s.id, label: `${s.full_name} (${s.nis})` }))
      );
    } catch {
      toast.error("Gagal memuat daftar santri");
    }
  };

  // ✅ FIX: ambil kelas dari endpoint yang benar, bukan dari santri
  const loadClasses = async () => {
    try {
      const res = await fetch("/api/master/classes");
      if (!res.ok) throw new Error();
      const list = await res.json();
      setClasses(
        list.map((c: any) => ({
          value: c.id,
          label: `${c.name}${c.student_count ? ` (${c.student_count} santri)` : ""}`,
        }))
      );
    } catch {
      toast.error("Gagal memuat daftar kelas");
    }
  };

  const downloadBlob = async (url: string, key: LoadingKey) => {
    setLoading(key);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal mengunduh laporan");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = key ?? "laporan";
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`✅ Berhasil mengunduh ${filename}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const exportSantri = (format: "pdf" | "xlsx") => {
    if (!selectedStudent) return toast.error("Pilih santri terlebih dahulu");
    downloadBlob(
      `/api/export/santri/${selectedStudent}?format=${format}`,
      `santri-${format}`
    );
  };

  const exportKelas = (format: "pdf" | "xlsx") => {
    if (!selectedClass) return toast.error("Pilih kelas terlebih dahulu");
    downloadBlob(
      `/api/export/kelas/${selectedClass}?format=${format}`,
      `kelas-${format}`
    );
  };

  const exportAnalitik = (format: "pdf" | "xlsx") => {
    const periodParam = selectedPeriod ? `&period=${encodeURIComponent(selectedPeriod)}` : "";
    downloadBlob(
      `/api/export/analitik?format=${format}${periodParam}`,
      `analitik-${format}`
    );
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Laporan &amp; Export</h1>
        <p className="text-muted-foreground mt-1">
          Generate dan unduh laporan dalam format PDF atau Excel
        </p>
      </div>

      {/* Keterangan format */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-destructive" />
          <strong>PDF</strong> — Siap cetak, rapi untuk arsip fisik
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="flex items-center gap-1.5">
          <Sheet className="h-4 w-4 text-success" />
          <strong>Excel (.xlsx)</strong> — Dapat diolah lebih lanjut
        </span>
      </div>

      {/* === KARTU 1: Rekam Jejak Santri === */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Rekam Jejak Per Santri</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Laporan 360° — identitas, absensi, hafalan, adab, perilaku, kasus
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-santri">Pilih Santri</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger id="select-santri" className="w-full">
                <SelectValue placeholder={students.length === 0 ? "Memuat..." : "Pilih santri..."} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={loading !== null || !selectedStudent}
              onClick={() => exportSantri("pdf")}
              className="gap-2"
            >
              {loading === "santri-pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              disabled={loading !== null || !selectedStudent}
              onClick={() => exportSantri("xlsx")}
              className="gap-2"
            >
              {loading === "santri-xlsx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === KARTU 2: Laporan Per Kelas === */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Laporan Per Kelas</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Daftar santri + rekap kehadiran, hafalan, perilaku, dan kasus per kelas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-kelas">Pilih Kelas</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="select-kelas" className="w-full">
                <SelectValue placeholder={classes.length === 0 ? "Memuat..." : "Pilih kelas..."} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={loading !== null || !selectedClass}
              onClick={() => exportKelas("pdf")}
              className="gap-2"
            >
              {loading === "kelas-pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              disabled={loading !== null || !selectedClass}
              onClick={() => exportKelas("xlsx")}
              className="gap-2"
            >
              {loading === "kelas-xlsx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === KARTU 3: Laporan Analitik === */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Laporan Analitik &amp; Statistik</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Statistik global — tren kehadiran, distribusi hafalan, dan ringkasan kasus
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-period">Periode Laporan</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger id="select-period" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Bulan Berjalan (Otomatis)</SelectItem>
                <SelectItem value="2024-ganjil">2024/2025 — Semester Ganjil</SelectItem>
                <SelectItem value="2024-genap">2024/2025 — Semester Genap</SelectItem>
                <SelectItem value="2025-ganjil">2025/2026 — Semester Ganjil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={loading !== null}
              onClick={() => exportAnalitik("pdf")}
              className="gap-2"
            >
              {loading === "analitik-pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              disabled={loading !== null}
              onClick={() => exportAnalitik("xlsx")}
              className="gap-2"
            >
              {loading === "analitik-xlsx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Catatan */}
      <p className="text-xs text-muted-foreground border-t pt-4">
        <BookOpen className="inline h-3.5 w-3.5 mr-1" />
        Laporan dihasilkan secara real-time dari data terbaru di database.
        Proses generate PDF bisa memakan waktu beberapa detik tergantung jumlah data.
      </p>
    </div>
  );
}