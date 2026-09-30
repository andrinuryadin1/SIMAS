"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Check, BookOpen, Layers, Users, Sparkles, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { RowActionMenu } from "@/components/row-action-menu";
import { toast } from "sonner";

type TabKey = "classes" | "halaqahs" | "kelas" | "subjects" | "academic-years" | "progress-aspects";

interface MasterItem {
  id: string;
  name: string;
  description?: string | null;
  pembina?: string | null;
  capacity?: number | null;
  semester?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: number;
  student_count?: number;
  jenjang_name?: string | null;
  level_name?: string | null;
  level_id?: string | null;
}

interface ProgressAspectItem {
  id: string;
  jenjang: string;
  level?: string | null;
  kelas?: string | null;
  category: string;
  aspect_name: string;
  description?: string | null;
  order_index: number;
}

const TABS: { key: TabKey; label: string; entity: string; singular: string }[] = [
  { key: "classes", label: "Jenjang", entity: "classes", singular: "Jenjang" },
  { key: "halaqahs", label: "Level", entity: "halaqahs", singular: "Level" },
  { key: "kelas", label: "Kelas", entity: "kelas", singular: "Kelas" },
  { key: "progress-aspects", label: "Aspek Perkembangan", entity: "progress-aspects", singular: "Aspek Perkembangan" },
  { key: "subjects", label: "Mata Pelajaran", entity: "subjects", singular: "Mata Pelajaran" },
  { key: "academic-years", label: "Tahun Ajaran", entity: "academic-years", singular: "Tahun Ajaran" },
];

const SEMESTERS = ["Ganjil", "Genap"];
const JENJANG_OPTIONS = ["Kuttab Awal", "Qonuni"];
const LEVEL_OPTIONS_MAP: Record<string, string[]> = {
  "Kuttab Awal": ["Kuttab Awal 1", "Kuttab Awal 2", "Kuttab Awal 3"],
  Qonuni: ["Qonuni 1", "Qonuni 2", "Qonuni 3", "Qonuni 4"],
};

export default function AdminMasterPage() {
  const [items, setItems] = useState<{
    classes: MasterItem[];
    halaqahs: MasterItem[];
    kelas: MasterItem[];
    subjects: MasterItem[];
    "academic-years": MasterItem[];
    "progress-aspects": ProgressAspectItem[];
  }>({
    classes: [],
    halaqahs: [],
    kelas: [],
    subjects: [],
    "academic-years": [],
    "progress-aspects": [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("classes");

  // Dialog state for general master items
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MasterItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    pembina: "",
    capacity: "30",
    semester: "Ganjil",
    startDate: "",
    endDate: "",
    jenjangName: "Kuttab Awal",
    levelId: "",
  });

  // Dialog and filter state for Progress Aspects
  const [aspectDialogOpen, setAspectDialogOpen] = useState(false);
  const [editingAspect, setEditingAspect] = useState<ProgressAspectItem | null>(null);
  const [aspectFilterJenjang, setAspectFilterJenjang] = useState<string>("all");
  const [aspectFilterLevel, setAspectFilterLevel] = useState<string>("all");
  const [aspectFilterKelas, setAspectFilterKelas] = useState<string>("all");
  const [aspectForm, setAspectForm] = useState({
    jenjang: "Kuttab Awal",
    level: "Kuttab Awal 1",
    kelas: "Semua",
    category: "Numerasi",
    aspectName: "",
    description: "",
    orderIndex: "1",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resClasses, resHalaqahs, resKelas, resSubjects, resAcademicYears, resAspects] = await Promise.all([
        fetch("/api/master/classes").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/master/halaqahs").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/master/kelas").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/master/subjects").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/master/academic-years").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/master/progress-aspects").then((r) => (r.ok ? r.json() : [])),
      ]);

      setItems({
        classes: resClasses,
        halaqahs: resHalaqahs,
        kelas: resKelas,
        subjects: resSubjects,
        "academic-years": resAcademicYears,
        "progress-aspects": resAspects,
      });
    } catch {
      toast.error("Gagal memuat data master");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentTabConfig = TABS.find((t) => t.key === activeTab)!;

  const openCreate = () => {
    if (activeTab === "progress-aspects") {
      setEditingAspect(null);
      setAspectForm({
        jenjang: aspectFilterJenjang !== "all" ? aspectFilterJenjang : "Kuttab Awal",
        level: aspectFilterLevel !== "all" ? aspectFilterLevel : "Kuttab Awal 1",
        kelas: aspectFilterKelas !== "all" ? aspectFilterKelas : "Semua",
        category: "Numerasi",
        aspectName: "",
        description: "",
        orderIndex: "1",
      });
      setAspectDialogOpen(true);
      return;
    }

    setEditing(null);
    setForm({
      name: "",
      description: "",
      pembina: "",
      capacity: "30",
      semester: "Ganjil",
      startDate: "",
      endDate: "",
      jenjangName: "Kuttab Awal",
      levelId: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: MasterItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      pembina: item.pembina ?? "",
      capacity: String(item.capacity ?? 30),
      semester: item.semester ?? "Ganjil",
      startDate: item.start_date ?? "",
      endDate: item.end_date ?? "",
      jenjangName: item.jenjang_name ?? "Kuttab Awal",
      levelId: item.level_id ?? "",
    });
    setDialogOpen(true);
  };

  const openEditAspect = (aspect: ProgressAspectItem) => {
    setEditingAspect(aspect);
    setAspectForm({
      jenjang: aspect.jenjang,
      level: aspect.level ?? "Semua",
      kelas: aspect.kelas ?? "Semua",
      category: aspect.category,
      aspectName: aspect.aspect_name,
      description: aspect.description ?? "",
      orderIndex: String(aspect.order_index ?? 1),
    });
    setAspectDialogOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setSaving(true);
    try {
      let payload: Record<string, unknown> = { name: form.name.trim() };
      if (activeTab === "classes") payload = { ...payload, capacity: Number(form.capacity) || 30 };
      if (activeTab === "halaqahs") {
        payload = {
          ...payload,
          pembina: form.pembina.trim() || null,
          jenjang_name: form.jenjangName,
        };
      }
      if (activeTab === "kelas") {
        const level = items.halaqahs.find((h) => h.id === form.levelId);
        if (!level) {
          toast.error("Level induk wajib dipilih");
          setSaving(false);
          return;
        }
        payload = {
          ...payload,
          capacity: Number(form.capacity) || 30,
          jenjang_name: level.jenjang_name ?? form.jenjangName,
          level_id: level.id,
          level_name: level.name,
        };
      }
      if (activeTab === "subjects") payload = { ...payload, description: form.description.trim() };
      if (activeTab === "academic-years") {
        payload = {
          ...payload,
          semester: form.semester,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        };
      }

      const res = await fetch(
        editing ? `/api/master/${currentTabConfig.entity}/${editing.id}` : `/api/master/${currentTabConfig.entity}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Gagal menyimpan");
        return;
      }
      toast.success((data as { message?: string }).message ?? "Tersimpan");
      setDialogOpen(false);
      await load();
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const submitAspect = async () => {
    if (!aspectForm.aspectName.trim()) {
      toast.error("Nama aspek perkembangan wajib diisi");
      return;
    }
    if (!aspectForm.category.trim()) {
      toast.error("Kategori aspek wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        jenjang: aspectForm.jenjang,
        level: aspectForm.level === "Semua" ? null : aspectForm.level,
        kelas: aspectForm.kelas === "Semua" ? null : aspectForm.kelas,
        category: aspectForm.category.trim(),
        aspectName: aspectForm.aspectName.trim(),
        description: aspectForm.description.trim() || null,
        orderIndex: Number(aspectForm.orderIndex) || 1,
      };

      const res = await fetch(
        editingAspect
          ? `/api/master/progress-aspects/${editingAspect.id}`
          : "/api/master/progress-aspects",
        {
          method: editingAspect ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Gagal menyimpan aspek perkembangan");
        return;
      }

      toast.success((data as { message?: string }).message ?? "Aspek perkembangan berhasil disimpan");
      setAspectDialogOpen(false);
      await load();
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const deleteAspect = async (id: string, name: string) => {
    if (!confirm(`Hapus aspek perkembangan "${name}"?`)) return;
    try {
      const res = await fetch(`/api/master/progress-aspects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Aspek perkembangan berhasil dihapus");
        await load();
      } else {
        toast.error("Gagal menghapus aspek");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  // Filtered aspects for UI display
  const filteredAspects = useMemo(() => {
    return items["progress-aspects"].filter((asp) => {
      if (aspectFilterJenjang !== "all" && asp.jenjang !== aspectFilterJenjang) return false;
      if (aspectFilterLevel !== "all" && asp.level !== aspectFilterLevel) return false;
      if (aspectFilterKelas !== "all" && asp.kelas !== aspectFilterKelas) return false;
      return true;
    });
  }, [items, aspectFilterJenjang, aspectFilterLevel, aspectFilterKelas]);

  // Grouped aspects by Category
  const groupedAspects = useMemo(() => {
    const map = new Map<string, ProgressAspectItem[]>();
    for (const asp of filteredAspects) {
      const cat = asp.category || "Umum";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(asp);
    }
    return Array.from(map.entries());
  }, [filteredAspects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Data Master</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data master Jenjang, Level, Kelas, Aspek Perkembangan, Mapel, dan Tahun Ajaran
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="py-2 text-xs md:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Jenjang, Level, Subjects, Academic Years */}
        {TABS.filter((t) => t.key !== "progress-aspects").map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <MasterCard
              config={tab}
              items={items[tab.key as keyof typeof items] as MasterItem[]}
              loading={loading}
              onAdd={openCreate}
              onEdit={openEdit}
            />
          </TabsContent>
        ))}

        {/* Tab Aspek Perkembangan (Role Guru Form Setting by Admin) */}
        <TabsContent value="progress-aspects" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Setting Aspek Perkembangan Santri
                  </CardTitle>
                  <CardDescription>
                    Admin menentukan indikator &amp; aspek perkembangan yang muncul pada form guru sesuai Jenjang dan Level santri.
                  </CardDescription>
                </div>
                <Button onClick={openCreate} size="sm" className="shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Aspek
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t mt-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Filter:</span>
                </div>

                <div className="w-44">
                  <Select
                    value={aspectFilterJenjang}
                    onValueChange={(v) => {
                      setAspectFilterJenjang(v);
                      setAspectFilterLevel("all");
                      setAspectFilterKelas("all");
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenjang</SelectItem>
                      {JENJANG_OPTIONS.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <Select
                    value={aspectFilterLevel}
                    onValueChange={(v) => {
                      setAspectFilterLevel(v);
                      setAspectFilterKelas("all");
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Level</SelectItem>
                      {aspectFilterJenjang === "all" ? (
                        items.halaqahs.map((h) => (
                          <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>
                        ))
                      ) : (
                        items.halaqahs
                          .filter((h) => h.jenjang_name === aspectFilterJenjang)
                          .map((h) => <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <Select
                    value={aspectFilterKelas}
                    onValueChange={setAspectFilterKelas}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {items.kelas
                        .filter((k) => aspectFilterLevel === "all" || k.level_name === aspectFilterLevel)
                        .map((k) => (
                          <SelectItem key={k.name} value={k.name}>{k.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Badge variant="secondary" className="text-xs ml-auto">
                  {filteredAspects.length} Aspek Ditemukan
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Memuat aspek perkembangan...</span>
                </div>
              ) : groupedAspects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Belum ada aspek perkembangan untuk filter ini</p>
                  <p className="text-xs mt-1">Klik tombol &quot;Tambah Aspek&quot; untuk menambahkan indikator capaian santri.</p>
                </div>
              ) : (
                groupedAspects.map(([category, aspects]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 border-b pb-1">
                      <span className="font-semibold text-sm text-foreground">{category}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {aspects.length} Indikator
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aspects.map((asp) => (
                        <div
                          key={asp.id}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary/90">
                                {asp.jenjang}
                              </Badge>
                              {asp.level ? (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {asp.level}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  Semua Level
                                </Badge>
                              )}
                              {asp.kelas ? (
                                <Badge variant="info" className="text-[10px] px-1.5 py-0">
                                  {asp.kelas}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  Semua Kelas
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground font-mono">
                                #{asp.order_index}
                              </span>
                            </div>
                            <p className="font-medium text-sm text-foreground">{asp.aspect_name}</p>
                            {asp.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {asp.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditAspect(asp)}
                              title="Edit Aspek"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteAspect(asp.id, asp.aspect_name)}
                              title="Hapus Aspek"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for General Master Items (Jenjang, Level, Mapel, Tahun Ajaran) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Tambah"} {currentTabConfig.singular}
            </DialogTitle>
            <DialogDescription>
              Data master akan digunakan di seluruh modul SIMAS.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {activeTab === "classes" && "Nama Jenjang"}
                {activeTab === "halaqahs" && "Nama Level"}
                {activeTab === "kelas" && "Nama Kelas"}
                {activeTab === "academic-years" && "Tahun Ajaran"}
                {activeTab === "subjects" && "Nama Mata Pelajaran"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={
                  activeTab === "classes"
                    ? "Contoh: Kuttab Awal atau Qonuni"
                    : activeTab === "halaqahs"
                    ? "Contoh: Kuttab Awal 1 atau Qonuni 1"
                    : activeTab === "kelas"
                    ? "Contoh: Kelas A atau Kelas B"
                    : `Nama ${currentTabConfig.singular.toLowerCase()}`
                }
                autoFocus
              />
            </div>

            {/* Jenjang Configuration (Classes) */}
            {activeTab === "classes" && (
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas Santri</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </div>
            )}

            {/* Level Configuration (Halaqahs) */}
            {activeTab === "halaqahs" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="jenjangName">Afiliasi Jenjang</Label>
                  <Select
                    value={form.jenjangName}
                    onValueChange={(v) => setForm({ ...form, jenjangName: v })}
                  >
                    <SelectTrigger id="jenjangName">
                      <SelectValue placeholder="Pilih Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      {JENJANG_OPTIONS.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Kelas Configuration — anak dari Level */}
            {activeTab === "kelas" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="levelId">
                    Level Induk <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.levelId}
                    onValueChange={(v) => {
                      const level = items.halaqahs.find((h) => h.id === v);
                      setForm({
                        ...form,
                        levelId: v,
                        jenjangName: level?.jenjang_name ?? form.jenjangName,
                      });
                    }}
                  >
                    <SelectTrigger id="levelId">
                      <SelectValue placeholder="Pilih Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.halaqahs.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          Belum ada level
                        </SelectItem>
                      ) : (
                        items.halaqahs.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                            {h.jenjang_name ? ` — ${h.jenjang_name}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Jenjang assigned otomatis dari level induk:{" "}
                    <span className="font-medium text-foreground">{form.jenjangName}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kelasCapacity">Kapasitas Santri</Label>
                  <Input
                    id="kelasCapacity"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
              </>
            )}

            {activeTab === "subjects" && (
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Opsional"
                />
              </div>
            )}

            {activeTab === "academic-years" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <div className="flex gap-2">
                    {SEMESTERS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={form.semester === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setForm({ ...form, semester: s })}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Mulai</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Selesai</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Progress Aspect */}
      <Dialog open={aspectDialogOpen} onOpenChange={setAspectDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingAspect ? "Edit" : "Tambah"} Aspek Perkembangan
            </DialogTitle>
            <DialogDescription>
              Tentukan indikator penilaian perkembangan yang akan diisi oleh Guru sesuai Jenjang, Level, dan Kelas santri.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Jenjang <span className="text-destructive">*</span></Label>
                <Select
                  value={aspectForm.jenjang}
                  onValueChange={(v) => {
                    setAspectForm({
                      ...aspectForm,
                      jenjang: v,
                      level: items.halaqahs.find((h) => h.jenjang_name === v)?.name ?? "Semua",
                      kelas: "Semua",
                    });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
                  <SelectContent>
                    {JENJANG_OPTIONS.map((j) => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                    <SelectItem value="Semua">Semua Jenjang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level Spesifik</Label>
                <Select
                  value={aspectForm.level}
                  onValueChange={(v) => {
                    setAspectForm({ ...aspectForm, level: v, kelas: "Semua" });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Level</SelectItem>
                    {(aspectForm.jenjang === "Semua"
                      ? items.halaqahs
                      : items.halaqahs.filter((h) => h.jenjang_name === aspectForm.jenjang)
                    ).map((h) => (
                      <SelectItem key={h.id} value={h.name}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kelas Spesifik</Label>
                <Select
                  value={aspectForm.kelas}
                  onValueChange={(v) => setAspectForm({ ...aspectForm, kelas: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Kelas</SelectItem>
                    {items.kelas
                      .filter((k) => aspectForm.level === "Semua" || k.level_name === aspectForm.level)
                      .map((k) => (
                        <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectCategory">Kategori / Bidang <span className="text-destructive">*</span></Label>
              <Input
                id="aspectCategory"
                value={aspectForm.category}
                onChange={(e) => setAspectForm({ ...aspectForm, category: e.target.value })}
                placeholder="Contoh: Numerasi, Calistung, Matematika, Adab & Karakter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectName">Nama Aspek / Indikator <span className="text-destructive">*</span></Label>
              <Input
                id="aspectName"
                value={aspectForm.aspectName}
                onChange={(e) => setAspectForm({ ...aspectForm, aspectName: e.target.value })}
                placeholder="Contoh: Mengenal Angka 1-10, Membaca Suku Kata"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectDesc">Deskripsi / Panduan Guru (Opsional)</Label>
              <Input
                id="aspectDesc"
                value={aspectForm.description}
                onChange={(e) => setAspectForm({ ...aspectForm, description: e.target.value })}
                placeholder="Contoh: Mengenal lambang bilangan secara konkret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectOrder">Nomor Urutan Tampil</Label>
              <Input
                id="aspectOrder"
                type="number"
                min={1}
                value={aspectForm.orderIndex}
                onChange={(e) => setAspectForm({ ...aspectForm, orderIndex: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAspectDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={submitAspect} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingAspect ? "Simpan Perubahan" : "Tambah Aspek"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MasterCard({
  config,
  items,
  loading,
  onAdd,
  onEdit,
}: {
  config: { key: TabKey; label: string; entity: string; singular: string };
  items: MasterItem[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (item: MasterItem) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data {config.label}</CardTitle>
            <CardDescription>{loading ? "Memuat..." : `${items.length} data`}</CardDescription>
          </div>
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah {config.singular}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border hover:bg-muted/50 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate text-foreground">{item.name}</p>
                  {config.key === "halaqahs" && item.jenjang_name && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Jenjang: {item.jenjang_name}
                    </Badge>
                  )}
                  {config.key === "kelas" && (
                    <>
                      {item.jenjang_name && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Jenjang: {item.jenjang_name}
                        </Badge>
                      )}
                      {item.level_name && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Level: {item.level_name}
                        </Badge>
                      )}
                    </>
                  )}
                  {item.is_active ? <Badge variant="default" className="text-[10px]">Aktif</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config.key === "classes" && `${item.student_count ?? 0} Santri · Kapasitas ${item.capacity ?? 30}`}
                  {config.key === "halaqahs" && `${item.student_count ?? 0} Santri`}
                  {config.key === "kelas" && `${item.student_count ?? 0} Santri · Kapasitas ${item.capacity ?? 30}${item.pembina ? ` · Pembina: ${item.pembina}` : ""}`}
                  {config.key === "subjects" && (item.description || "Tanpa deskripsi")}
                  {config.key === "academic-years" &&
                    `Semester ${item.semester ?? "-"}${
                      item.start_date ? ` · ${item.start_date} s/d ${item.end_date ?? "-"}` : ""
                    }`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {config.key === "academic-years" && (
                  <RowActionMenu
                    actions={[
                      item.is_active
                        ? {
                            kind: "request",
                            label: "Nonaktifkan",
                            method: "PATCH",
                            url: `/api/master/${config.entity}/${item.id}`,
                            body: { isActive: false },
                            successMessage: "Tahun ajaran dinonaktifkan",
                          }
                        : {
                            kind: "request",
                            label: "Jadikan Aktif",
                            icon: <Check className="mr-2 h-4 w-4" />,
                            method: "PATCH",
                            url: `/api/master/${config.entity}/${item.id}`,
                            body: { isActive: true },
                            successMessage: "Tahun ajaran diaktifkan",
                          },
                    ]}
                  />
                )}
                <RowActionMenu
                  actions={[
                    { kind: "callback", label: "Edit", icon: <Edit className="mr-2 h-4 w-4" />, onClick: () => onEdit(item) },
                    {
                      kind: "request",
                      label: "Hapus",
                      icon: <Trash2 className="mr-2 h-4 w-4" />,
                      method: "DELETE",
                      url: `/api/master/${config.entity}/${item.id}`,
                      destructive: true,
                      confirm: `Hapus ${config.singular.toLowerCase()} "${item.name}"?`,
                      successMessage: "Data dihapus",
                    },
                  ]}
                />
              </div>
            </div>
          ))
        )}

        {!loading && items.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Belum ada data. Klik &quot;Tambah {config.singular}&quot; untuk memulai.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
