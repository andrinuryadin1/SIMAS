"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Camera, User } from "lucide-react";

interface ClassOption { value: string; label: string; }
interface HalaqahOption { value: string; label: string; jenjangName?: string | null; }
interface KelasOption { value: string; label: string; levelId?: string | null; levelName?: string | null; }

export default function AdminTambahSantriPage() {
  const today = new Date().toISOString().split("T")[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [halaqahs, setHalaqahs] = useState<HalaqahOption[]>([]);
  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nis: "",
    fullName: "",
    gender: "L",
    birthDate: today,
    birthPlace: "Bandung",
    address: "",
    classId: "",
    halaqahId: "",
    kelasId: "",
    academicYearId: "ay-2024",
    enrollmentDate: today,
    fatherName: "",
    motherName: "",
    guardianName: "",
    guardianPhone: "",
    photoUrl: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/master/classes").then((r) => (r.ok ? r.json() : [])).then((data) => setClasses(Array.isArray(data) ? data.map((c: any) => ({ value: c.id, label: c.name })) : [])),
      fetch("/api/master/halaqahs").then((r) => (r.ok ? r.json() : [])).then((data) => setHalaqahs(Array.isArray(data) ? data.map((h: any) => ({ value: h.id, label: h.name, jenjangName: h.jenjang_name })) : [])),
      fetch("/api/master/kelas").then((r) => (r.ok ? r.json() : [])).then((data) => setKelasList(Array.isArray(data) ? data.map((k: any) => ({ value: k.id, label: k.name, levelId: k.level_id, levelName: k.level_name })) : [])),
    ]).catch(() => {
      toast.error("Gagal memuat opsi jenjang/level/kelas");
    }).finally(() => setLoading(false));
  }, []);

  // Jenjang → Level → Kelas. Kelas hanya boleh dipilih dari level yang aktif,
  // dan level difilter mengikuti jenjang yang dipilih.
  const selectedJenjangName = classes.find((c) => c.value === form.classId)?.label;
  const availableHalaqahs = form.classId
    ? halaqahs.filter((h) => !h.jenjangName || !selectedJenjangName || h.jenjangName === selectedJenjangName)
    : halaqahs;
  const availableKelas = form.halaqahId
    ? kelasList.filter((k) => k.levelId === form.halaqahId)
    : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, atau WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, photoUrl: base64 }));
      toast.success("Foto santri berhasil dipilih");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nis || !form.fullName) { toast.error("NIS dan Nama Lengkap wajib diisi"); return; }
    if (!form.classId) { toast.error("Jenjang wajib dipilih"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/santri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nis: form.nis,
          full_name: form.fullName,
          gender: form.gender,
          birth_date: form.birthDate,
          birth_place: form.birthPlace,
          address: form.address || null,
          class_id: form.classId || null,
          class_name: classes.find((c) => c.value === form.classId)?.label || "",
          halaqah_id: form.halaqahId || null,
          halaqah_name: halaqahs.find((h) => h.value === form.halaqahId)?.label || null,
          kelas_id: form.kelasId || null,
          kelas_name: kelasList.find((k) => k.value === form.kelasId)?.label || null,
          academic_year_id: form.academicYearId,
          enrollment_date: form.enrollmentDate,
          father_name: form.fatherName,
          mother_name: form.motherName,
          guardian_name: form.guardianName,
          guardian_phone: form.guardianPhone,
          photo_url: form.photoUrl || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menambah santri");
      toast.success("Santri berhasil ditambahkan");
      window.location.href = "/admin/santri";
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-600 font-medium">Memuat data...</div>;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in pb-12">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tambah Santri Baru
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Isi formulir di bawah untuk mendaftarkan santri baru ke dalam sistem
        </p>
      </div>

      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Formulir Data Santri</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Lengkapi data diri, halaqah binaan, serta kontak orang tua / wali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Foto Santri Upload & Preview Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <Label className="text-sm font-bold text-slate-900">Foto Profil Santri</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="size-20 ring-2 ring-slate-200 border-2 border-white shadow-xs">
                  <AvatarImage src={form.photoUrl} alt={form.fullName || "Santri"} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xl font-bold">
                    {form.fullName ? form.fullName.slice(0, 2).toUpperCase() : <User className="size-8 text-emerald-600" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-slate-300 font-semibold text-slate-800 hover:bg-slate-100 h-9 gap-1.5"
                    >
                      <Camera className="size-4 text-primary" />
                      <span>Upload Foto dari Komputer</span>
                    </Button>

                    {form.photoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="text-rose-600 hover:bg-rose-50 h-9 gap-1 text-xs font-semibold"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Hapus Foto</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Format yang didukung: JPG, PNG, WebP. Ukuran berkas maks. 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nis" className="text-xs font-bold text-slate-800">NIS <span className="text-rose-600">*</span></Label>
                <Input id="nis" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} placeholder="Contoh: 2024001" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-bold text-slate-800">Nama Lengkap <span className="text-rose-600">*</span></Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Nama lengkap santri" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-bold text-slate-800">Jenis Kelamin</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birthPlace" className="text-xs font-bold text-slate-800">Tempat Lahir</Label>
                <Input id="birthPlace" value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} placeholder="Tempat lahir" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birthDate" className="text-xs font-bold text-slate-800">Tanggal Lahir</Label>
                <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-bold text-slate-800">Alamat Lengkap</Label>
              <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat tempat tinggal santri" rows={2} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="classId" className="text-xs font-bold text-slate-800">Jenjang</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v, halaqahId: "", kelasId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih jenjang" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="halaqahId" className="text-xs font-bold text-slate-800">Level</Label>
                <Select value={form.halaqahId} onValueChange={(v) => setForm({ ...form, halaqahId: v, kelasId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih level" /></SelectTrigger>
                  <SelectContent>
                    {availableHalaqahs.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kelasId" className="text-xs font-bold text-slate-800">Kelas</Label>
                <Select value={form.kelasId} onValueChange={(v) => setForm({ ...form, kelasId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                  <SelectContent>
                    {availableKelas.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                    {availableKelas.length === 0 && <SelectItem value="" disabled>Belum ada kelas untuk level ini</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fatherName" className="text-xs font-bold text-slate-800">Nama Ayah</Label>
                <Input id="fatherName" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Nama ayah kandung" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="motherName" className="text-xs font-bold text-slate-800">Nama Ibu</Label>
                <Input id="motherName" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} placeholder="Nama ibu kandung" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guardianName" className="text-xs font-bold text-slate-800">Nama Wali</Label>
                <Input id="guardianName" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="Nama wali santri" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardianPhone" className="text-xs font-bold text-slate-800">Nomor Telepon/WA Wali</Label>
                <Input id="guardianPhone" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="Contoh: 081234567890" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="enrollmentDate" className="text-xs font-bold text-slate-800">Tanggal Masuk</Label>
                <Input id="enrollmentDate" type="date" value={form.enrollmentDate} onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="photoUrl" className="text-xs font-bold text-slate-800">Atau Tautan URL Foto</Label>
                <Input id="photoUrl" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://contoh.com/foto.jpg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="academicYearId" className="text-xs font-bold text-slate-800">Tahun Ajaran</Label>
                <Select value={form.academicYearId} onValueChange={(v) => setForm({ ...form, academicYearId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ay-2024">2024/2025</SelectItem>
                    <SelectItem value="ay-2025">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-bold text-slate-800">Catatan Tambahan (Opsional)</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan latar belakang atau kebutuhan khusus santri" rows={3} />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button type="submit" disabled={saving} className="font-bold px-6">
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Simpan & Daftarkan Santri
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={saving} className="border-slate-300 font-bold text-slate-700">
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}