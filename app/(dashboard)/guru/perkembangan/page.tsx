"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2, BookOpen, AlertCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentOption {
  id: string;
  nis: string;
  full_name: string;
  class_name: string; // Jenjang
  halaqah_name: string | null; // Level
  kelas_name: string | null; // Kelas
}

interface DynamicAspect {
  id: string;
  jenjang: string;
  level: string | null;
  kelas: string | null;
  category: string;
  aspect_name: string;
  description: string | null;
  order_index: number;
}

interface ExistingRecord {
  id: string;
  student_id: string;
  subject_category: string;
  aspect_name: string;
  period: string;
  level: string;
  score?: number | null;
  note?: string | null;
  recorded_at: string;
}

const RATING_LEVELS = [
  { value: "mahir", label: "Mahir", badgeBg: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { value: "berkembang", label: "Berkembang", badgeBg: "bg-blue-600 hover:bg-blue-700 text-white" },
  { value: "sedang_berkembang", label: "Sedang Berkembang", badgeBg: "bg-amber-600 hover:bg-amber-700 text-white" },
  { value: "belum", label: "Belum", badgeBg: "bg-slate-600 hover:bg-slate-700 text-white" },
];

export default function GuruPerkembanganPage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [aspects, setAspects] = useState<DynamicAspect[]>([]);
  const [existingRecords, setExistingRecords] = useState<ExistingRecord[]>([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAspects, setLoadingAspects] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    period: "2024/2025-ganjil",
    recordedAt: new Date().toISOString().split("T")[0],
    ratings: {} as Record<string, string>, // aspect_name -> rating level
    notes: {} as Record<string, string>, // aspect_name -> note
  });

  // Load students from /api/me or /api/santri
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        const studentList = data.students ?? [];
        setStudents(studentList);
        if (studentList.length > 0) {
          const first = studentList[0];
          setSelectedStudent(first);
          setForm((prev) => ({ ...prev, studentId: first.id }));
        }
        setLoadingStudents(false);
      })
      .catch(() => {
        setLoadingStudents(false);
        toast.error("Gagal memuat daftar santri");
      });
  }, []);

  // When selected student or period changes: fetch dynamic aspects configured by Admin and previous records
  const loadAspectsAndHistory = useCallback(async (student: StudentOption, period: string) => {
    setLoadingAspects(true);
    try {
      // 1. Fetch dynamic aspects tailored for this student's Jenjang & Level & Kelas
      const params = new URLSearchParams();
      if (student.class_name) params.set("jenjang", student.class_name);
      if (student.halaqah_name) params.set("level", student.halaqah_name);
      if (student.kelas_name) params.set("kelas", student.kelas_name);

      let resAspects = await fetch(`/api/master/progress-aspects?${params.toString()}`);
      let aspectsData: DynamicAspect[] = resAspects.ok ? await resAspects.json() : [];

      // Fallback: If no aspects found for specific level+kelas, fetch by jenjang+level
      if (aspectsData.length === 0 && student.class_name && student.halaqah_name) {
        const fallbackParams = new URLSearchParams();
        fallbackParams.set("jenjang", student.class_name);
        fallbackParams.set("level", student.halaqah_name);
        const fallbackRes = await fetch(`/api/master/progress-aspects?${fallbackParams.toString()}`);
        if (fallbackRes.ok) {
          aspectsData = await fallbackRes.json();
        }
      }

      // Fallback: If still empty, fetch by jenjang only
      if (aspectsData.length === 0 && student.class_name) {
        const fallbackRes = await fetch(`/api/master/progress-aspects?jenjang=${encodeURIComponent(student.class_name)}`);
        if (fallbackRes.ok) {
          aspectsData = await fallbackRes.json();
        }
      }

      // If still empty, fetch all active aspects
      if (aspectsData.length === 0) {
        const allRes = await fetch("/api/master/progress-aspects");
        if (allRes.ok) aspectsData = await allRes.json();
      }

      setAspects(aspectsData);

      // 2. Fetch existing recorded progress for this student and period
      const recRes = await fetch(`/api/progress?studentId=${student.id}&period=${period}`);
      if (recRes.ok) {
        const records: ExistingRecord[] = await recRes.json();
        setExistingRecords(records);

        // Pre-fill ratings and notes with existing records
        const initialRatings: Record<string, string> = {};
        const initialNotes: Record<string, string> = {};
        records.forEach((r) => {
          initialRatings[r.aspect_name] = r.level;
          if (r.note) initialNotes[r.aspect_name] = r.note;
        });

        setForm((prev) => ({
          ...prev,
          ratings: initialRatings,
          notes: initialNotes,
        }));
      }
    } catch (err) {
      console.error("Failed to load aspects:", err);
      toast.error("Gagal memuat aspek perkembangan");
    } finally {
      setLoadingAspects(false);
    }
  }, []);

  // Handle student select change
  const handleStudentChange = (studentId: string) => {
    const s = students.find((item) => item.id === studentId) || null;
    setSelectedStudent(s);
    setForm((prev) => ({
      ...prev,
      studentId,
      ratings: {},
      notes: {},
    }));
    if (s) {
      void loadAspectsAndHistory(s, form.period);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setForm((prev) => ({ ...prev, period, ratings: {}, notes: {} }));
    if (selectedStudent) {
      void loadAspectsAndHistory(selectedStudent, period);
    }
  };

  // Trigger initial load when selectedStudent is ready
  useEffect(() => {
    if (selectedStudent) {
      void loadAspectsAndHistory(selectedStudent, form.period);
    }
  }, [selectedStudent, loadAspectsAndHistory]);

  // Group dynamic aspects by category (Numerasi, Calistung, etc.)
  const groupedAspects = useMemo(() => {
    const map = new Map<string, DynamicAspect[]>();
    for (const asp of aspects) {
      const cat = asp.category || "Umum";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(asp);
    }
    return Array.from(map.entries());
  }, [aspects]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) {
      toast.error("Pilih santri terlebih dahulu");
      return;
    }

    const filledAspectNames = Object.keys(form.ratings);
    if (filledAspectNames.length === 0) {
      toast.error("Pilih minimal satu level capaian perkembangan");
      return;
    }

    setSaving(true);
    try {
      const entries = [];
      for (const aspect of aspects) {
        const rating = form.ratings[aspect.aspect_name];
        if (rating) {
          entries.push({
            studentId: form.studentId,
            subjectCategory: aspect.category,
            aspectName: aspect.aspect_name,
            period: form.period,
            level: rating,
            note: form.notes[aspect.aspect_name] || null,
            recordedAt: form.recordedAt,
          });
        }
      }

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: entries }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal menyimpan perkembangan");
      }

      toast.success(`Berhasil menyimpan perkembangan santri (${entries.length} aspek tersimpan)`);
      if (selectedStudent) {
        void loadAspectsAndHistory(selectedStudent, form.period);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan perkembangan");
    } finally {
      setSaving(false);
    }
  };

  if (loadingStudents) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Memuat data santri...</span>
      </div>
    );
  }

  const filledCount = Object.keys(form.ratings).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Perkembangan Santri</h1>
        <p className="text-muted-foreground mt-1">
          Form penilaian perkembangan santri disesuaikan otomatis dengan Jenjang &amp; Level yang ditentukan Admin.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Pilih Santri &amp; Periode</CardTitle>
          <CardDescription>
            Pilih santri untuk memuat form perkembangan spesifik sesuai jenjang dan levelnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student">Santri</Label>
              <Select value={form.studentId} onValueChange={handleStudentChange}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Pilih santri" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} ({s.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Periode Penilaian</Label>
              <Select value={form.period} onValueChange={handlePeriodChange}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025-ganjil">2024/2025 - Semester Ganjil</SelectItem>
                  <SelectItem value="2024/2025-genap">2024/2025 - Semester Genap</SelectItem>
                  <SelectItem value="2025/2026-ganjil">2025/2026 - Semester Ganjil</SelectItem>
                  <SelectItem value="2025/2026-genap">2025/2026 - Semester Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordedAt">Tanggal Penilaian</Label>
              <Input
                id="recordedAt"
                type="date"
                value={form.recordedAt}
                onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
              />
            </div>
          </div>

          {/* Student Jenjang & Level Information Banner */}
          {selectedStudent && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-sm text-foreground">{selectedStudent.full_name}</span>
                <span className="text-muted-foreground text-xs font-mono">({selectedStudent.nis})</span>
                <span className="text-muted-foreground">·</span>
                <Badge variant="default" className="text-xs">
                  Jenjang: {selectedStudent.class_name}
                </Badge>
                {selectedStudent.halaqah_name && (
                  <Badge variant="secondary" className="text-xs">
                    Level: {selectedStudent.halaqah_name}
                  </Badge>
                )}
                {selectedStudent.kelas_name && (
                  <Badge variant="info" className="text-xs">
                    Kelas: {selectedStudent.kelas_name}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Form disesuaikan dengan setting Admin ({aspects.length} aspek)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Aspects Form */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Form Capaian Aspek Perkembangan</CardTitle>
            <CardDescription>
              {filledCount} dari {aspects.length} aspek telah dinilai
              {existingRecords.length > 0 && ` · (${existingRecords.length} penilaian telah tersimpan sebelumnya)`}
            </CardDescription>
          </div>

          {existingRecords.length > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1 font-normal text-muted-foreground">
              <History className="h-3 w-3" />
              Ada riwayat tersimpan
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {loadingAspects ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Memuat aspek perkembangan untuk {selectedStudent?.full_name}...</span>
            </div>
          ) : groupedAspects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="font-medium text-foreground">Belum ada aspek yang disetting oleh Admin untuk jenjang ini</p>
              <p className="text-xs mt-1">
                Admin dapat mengatur aspek perkembangan di menu <strong>Data Master &rarr; Aspek Perkembangan</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {groupedAspects.map(([category, catAspects]) => (
                <div key={category} className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-base text-foreground">{category}</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {catAspects.length} Indikator
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {catAspects.map((aspect) => {
                      const currentRating = form.ratings[aspect.aspect_name];
                      const currentNote = form.notes[aspect.aspect_name] || "";

                      return (
                        <div
                          key={aspect.id}
                          className={cn(
                            "p-4 rounded-lg border transition-colors space-y-3",
                            currentRating ? "border-primary/30 bg-primary/[0.02]" : "bg-card"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm text-foreground">{aspect.aspect_name}</p>
                              {aspect.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{aspect.description}</p>
                              )}
                            </div>

                            {/* Rating Selector Buttons */}
                            <div className="flex flex-wrap gap-1.5 shrink-0">
                              {RATING_LEVELS.map((rl) => {
                                const isSelected = currentRating === rl.value;
                                return (
                                  <Button
                                    key={rl.value}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                      "text-xs h-8 px-2.5",
                                      isSelected && rl.badgeBg
                                    )}
                                    onClick={() =>
                                      setForm((prev) => ({
                                        ...prev,
                                        ratings: {
                                          ...prev.ratings,
                                          [aspect.aspect_name]: isSelected ? "" : rl.value,
                                        },
                                      }))
                                    }
                                  >
                                    {rl.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Optional Note for this aspect */}
                          <div className="pt-1">
                            <Input
                              placeholder="Catatan perkembangan khusus santri pada aspek ini (opsional)..."
                              value={currentNote}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  notes: {
                                    ...prev.notes,
                                    [aspect.aspect_name]: e.target.value,
                                  },
                                }))
                              }
                              className="text-xs h-8 bg-background/50"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" disabled={saving || filledCount === 0}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Penilaian Perkembangan ({filledCount} Aspek)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      ratings: {},
                      notes: {},
                    }))
                  }
                  disabled={saving || filledCount === 0}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}