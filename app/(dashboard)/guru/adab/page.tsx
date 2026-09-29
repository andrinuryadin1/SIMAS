"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StudentOption { value: string; label: string; }

export default function GuruAdabPage() {
  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    period: "daily",
    date: today,
    scoreHonesty: "",
    scoreIndependence: "",
    scoreSocial: "",
    scoreCleanliness: "",
    scoreDiscipline: "",
    note: "",
  });

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((data) => {
      setStudents((data.students ?? []).map((s: any) => ({ value: s.id, label: `${s.full_name} (${s.nis})` })));
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error("Gagal memuat daftar santri"); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) { toast.error("Pilih santri terlebih dahulu"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/adab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          date: form.date,
          period: form.period,
          scoreHonesty: form.scoreHonesty ? parseInt(form.scoreHonesty) : null,
          scoreIndependence: form.scoreIndependence ? parseInt(form.scoreIndependence) : null,
          scoreSocial: form.scoreSocial ? parseInt(form.scoreSocial) : null,
          scoreCleanliness: form.scoreCleanliness ? parseInt(form.scoreCleanliness) : null,
          scoreDiscipline: form.scoreDiscipline ? parseInt(form.scoreDiscipline) : null,
          note: form.note || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      toast.success("Penilaian adab berhasil disimpan");
      setForm({ ...form, scoreHonesty: "", scoreIndependence: "", scoreSocial: "", scoreCleanliness: "", scoreDiscipline: "", note: "" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center">Memuat...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Penilaian Adab & Sikap</h1>
        <p className="text-muted-foreground mt-1">Nilai sikap santri per indikator (skala 1-4)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Penilaian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Santri</Label>
                <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Periode Penilaian</Label>
                <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih periode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="semester">Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            <div className="space-y-4 border-t pt-4">
              {[
                { key: "scoreHonesty", label: "Kejujuran" },
                { key: "scoreIndependence", label: "Kemandirian" },
                { key: "scoreSocial", label: "Akhlak Sesama" },
                { key: "scoreCleanliness", label: "Kebersihan" },
                { key: "scoreDiscipline", label: "Kedisiplinan" },
              ].map((ind) => (
                <div key={ind.key} className="space-y-2">
                  <Label htmlFor={ind.key}>{ind.label}</Label>
                  <Select value={form[ind.key as keyof typeof form] as string} onValueChange={(v) => setForm({ ...form, [ind.key]: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih nilai" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 - Sangat Baik</SelectItem>
                      <SelectItem value="3">3 - Baik</SelectItem>
                      <SelectItem value="2">2 - Cukup</SelectItem>
                      <SelectItem value="1">1 - Perlu Perbaikan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Input id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Catatan tambahan (opsional)" />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Penilaian
              </Button>
              <Button type="button" variant="outline" onClick={() => setForm({ ...form, scoreHonesty: "", scoreIndependence: "", scoreSocial: "", scoreCleanliness: "", scoreDiscipline: "", note: "" })} disabled={saving}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}