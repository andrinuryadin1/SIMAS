"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StudentOption { value: string; label: string; }

export default function GuruPerilakuPage() {
  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    date: today,
    type: "positif",
    category: "",
    severity: "",
    description: "",
    actionTaken: "",
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
    if (!form.category) { toast.error("Isi kategori perilaku"); return; }
    if (!form.description) { toast.error("Isi deskripsi perilaku"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/behaviors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          type: form.type,
          category: form.category,
          severity: form.severity || null,
          description: form.description,
          actionTaken: form.actionTaken || null,
          date: form.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      toast.success("Catatan perilaku berhasil disimpan");
      setForm({ ...form, category: "", severity: "", description: "", actionTaken: "" });
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
        <h1 className="font-heading text-3xl font-bold text-secondary">Catatan Perilaku</h1>
        <p className="text-muted-foreground mt-1">Catat perilaku baik dan pelanggaran santri</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pencatatan Perilaku</CardTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Jenis Perilaku</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positif">Perilaku Positif</SelectItem>
                    <SelectItem value="pelanggaran">Pelanggaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Contoh: kepemimpinan, kedisiplinan, dll" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Tingkat Keparahan</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih tingkat (opsional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ringan">Ringan</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="berat">Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Perilaku</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Jelaskan perilaku yang diamati..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionTaken">Tindakan yang Diambil</Label>
              <Textarea id="actionTaken" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} placeholder="Tindakan guru terhadap perilaku ini..." rows={3} />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Catatan
              </Button>
              <Button type="button" variant="outline" onClick={() => setForm({ ...form, category: "", severity: "", description: "", actionTaken: "" })} disabled={saving}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}