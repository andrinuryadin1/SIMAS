"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface HalaqahOption { value: string; label: string; }

export default function GuruJurnalPage() {
  const today = new Date().toISOString().split("T")[0];
  const [halaqahs, setHalaqahs] = useState<HalaqahOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: today,
    subject: "tahfidz",
    topic: "",
    method: "",
    summary: "",
    obstacles: "",
    reflection: "",
    halaqahId: "",
  });

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((data) => {
      if (data.halaqahId) {
        setHalaqahs([{ value: data.halaqahId, label: data.halaqahName || "Halaqah Saya" }]);
        setForm((f) => ({ ...f, halaqahId: data.halaqahId }));
      }
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error("Gagal memuat info halaqah"); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) { toast.error("Isi topik pembelajaran"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          halaqahId: form.halaqahId || null,
          subject: form.subject,
          date: form.date,
          topic: form.topic,
          method: form.method || null,
          summary: form.summary || null,
          obstacles: form.obstacles || null,
          reflection: form.reflection || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      toast.success("Jurnal mengajar berhasil disimpan");
      setForm({ ...form, topic: "", method: "", summary: "", obstacles: "", reflection: "" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center">Memuat...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Jurnal Mengajar</h1>
        <p className="text-muted-foreground mt-1">Catat materi dan refleksi pembelajaran harian</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Jurnal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Mata Pelajaran</Label>
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tahfidz">Tahfidz Qur'an</SelectItem>
                    <SelectItem value="adab">Adab & Akhlak</SelectItem>
                    <SelectItem value="berhitung">Berhitung</SelectItem>
                    <SelectItem value="calistung">Calistung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topik Pembelajaran</Label>
              <Input id="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Topik yang diajarkan hari ini" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Metode Pembelajaran</Label>
              <Input id="method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Metode yang digunakan (e.g., klasikal, diskusi, dll)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Ringkasan Materi</Label>
              <Textarea id="summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Jelaskan materi yang diajarkan..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obstacles">Kendala</Label>
              <Textarea id="obstacles" value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} placeholder="Kendala yang dihadapi saat pembelajaran (opsional)" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflection">Refleksi</Label>
              <Textarea id="reflection" value={form.reflection} onChange={(e) => setForm({ ...form, reflection: e.target.value })} placeholder="Refleksi dan rencana perbaikan (opsional)" rows={3} />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Jurnal
              </Button>
              <Button type="button" variant="outline" onClick={() => setForm({ ...form, topic: "", method: "", summary: "", obstacles: "", reflection: "" })} disabled={saving}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}