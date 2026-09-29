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
import Link from "next/link";

interface StudentOption { value: string; label: string; }

export default function GuruKasusBaruPage() {
  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    title: "",
    description: "",
    category: "kedisiplinan",
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
    if (!form.title) { toast.error("Isi judul kasus"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          title: form.title,
          description: form.description,
          category: form.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat kasus");
      toast.success("Kasus berhasil dibuat");
      window.location.href = `/guru/kasus/${data.id}`;
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center">Memuat...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/guru/kasus">
          <Button variant="ghost" size="sm">← Kembali</Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Lapor Kasus Baru</h1>
          <p className="text-muted-foreground mt-1">Catat kasus khusus santri</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Kasus Baru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="title">Judul Kasus</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul singkat kasus" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kedisiplinan">Kedisiplinan</SelectItem>
                  <SelectItem value="akhlak">Akhlak</SelectItem>
                  <SelectItem value="akademik">Akademik</SelectItem>
                  <SelectItem value="kesehatan">Kesehatan</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi detail kasus..." rows={4} />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Kasus
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={saving}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}