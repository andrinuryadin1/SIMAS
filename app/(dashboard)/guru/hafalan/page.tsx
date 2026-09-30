"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { QuranSurahs, getJuzRange } from "@/lib/quran-surahs";

interface StudentOption {
  id: string;
  nis: string;
  full_name: string;
  class_name: string;
}

type HafalanType = "ziyadah" | "murojaah";
type Quality = "A" | "B" | "C" | "D";

export default function GuruHafalanPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    studentId: "",
    date: today,
    type: "ziyadah" as HafalanType,
    surahId: "", // changed from surahName to surahId
    ayahStart: 1,
    ayahEnd: 1,
    juz: 0,
    quality: "A" as Quality,
    note: "",
  });

  // Auto-set ayahEnd max based on selected surah
  const selectedSurah = QuranSurahs.find((s) => s.id === form.surahId);
  const maxAyah = selectedSurah?.ayat ?? 286;

  useEffect(() => {
    if (form.surahId) {
      setForm((prev) => ({
        ...prev,
        ayahStart: 1,
        ayahEnd: Math.min(prev.ayahEnd, maxAyah),
      }));
    }
  }, [form.surahId, maxAyah]);

  const loadStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/santri");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.map((s: any) => ({
          id: s.id,
          nis: s.nis,
          full_name: s.full_name,
          class_name: s.class_name,
        })));
      }
    } catch {
      setError("Gagal memuat data santri");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setError("Sesi login tidak valid");
      return;
    }
    if (!form.studentId) {
      setError("Pilih santri terlebih dahulu");
      return;
    }
    if (!form.surahId) {
      setError("Pilih surah terlebih dahulu");
      return;
    }
    if (form.ayahStart > form.ayahEnd) {
      setError("Ayat awal tidak boleh lebih besar dari ayat akhir");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const surah = selectedSurah!;
      const res = await fetch("/api/memorization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId,
          surahName: surah.name,
          surahNumber: surah.number,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setSaved(true);
      setForm((prev) => ({ ...prev, surahId: "", ayahStart: 1, ayahEnd: 1, note: "" }));
    } catch {
      setError("Gagal menyimpan setoran hafalan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Setoran Hafalan Qur'an</h1>
        <p className="text-muted-foreground mt-1">Catat progress hafalan santri</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Setoran Hafalan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Santri</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(v) => handleChange("studentId", v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Memuat..." : "Pilih santri"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name} ({s.nis}) - {s.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Setoran</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v as HafalanType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ziyadah">Ziyadah (Hafalan Baru)</SelectItem>
                    <SelectItem value="murojaah">Murojaah (Mengulang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="surah">Surah <span className="text-destructive">*</span></Label>
                <Select
                  value={form.surahId}
                  onValueChange={(v) => handleChange("surahId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih surah" />
                  </SelectTrigger>
                  <SelectContent className="max-h-96">
                    {QuranSurahs.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.number}. {s.name} ({s.arab}) — {s.ayat} ayat
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSurah && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Surah {selectedSurah.number} · {selectedSurah.name} · {selectedSurah.ayat} ayat · mulai Juz {getJuzRange(selectedSurah.number).start}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ayahStart">Ayat Awal</Label>
                <Input
                  id="ayahStart"
                  type="number"
                  min="1"
                  max={maxAyah}
                  value={form.ayahStart}
                  onChange={(e) => handleChange("ayahStart", Math.min(Number(e.target.value), maxAyah))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayahEnd">Ayat Akhir</Label>
                <Input
                  id="ayahEnd"
                  type="number"
                  min="1"
                  max={maxAyah}
                  value={form.ayahEnd}
                  onChange={(e) => handleChange("ayahEnd", Math.min(Number(e.target.value), maxAyah))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="juz">Juz (Opsional)</Label>
                <Input
                  id="juz"
                  type="number"
                  min="0"
                  max="30"
                  value={form.juz}
                  onChange={(e) => handleChange("juz", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Nilai Kualitas</Label>
              <Select
                value={form.quality}
                onValueChange={(v) => handleChange("quality", v as Quality)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Sempurna</SelectItem>
                  <SelectItem value="B">B - Baik</SelectItem>
                  <SelectItem value="C">C - Cukup</SelectItem>
                  <SelectItem value="D">D - Perlu Latihan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Textarea
                id="note"
                placeholder="Catatan tentang setoran hafalan"
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Simpan Setoran
              </Button>
              <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, surahId: "", ayahStart: 1, ayahEnd: 1, note: "" }))}>
                Bersihkan Form
              </Button>
            </div>
          </form>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {saved && (
            <p className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Setoran hafalan berhasil disimpan.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}