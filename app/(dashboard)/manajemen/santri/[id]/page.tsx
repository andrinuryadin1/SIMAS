"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Phone, MapPin, Users, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Student {
  id: string;
  nis: string;
  full_name: string;
  gender: string;
  birth_date: string;
  birth_place: string;
  address: string | null;
  class_name: string;
  halaqah_name: string | null;
  academic_year_id: string;
  enrollment_date: string | null;
  father_name: string;
  mother_name: string;
  guardian_name: string;
  guardian_phone: string;
  photo_url: string | null;
  status: string;
  notes: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  halaqah_id: string | null;
}

interface MemorizationRecord {
  id: string;
  type: string;
  surah_name: string;
  ayah_start: number;
  ayah_end: number;
  juz: number | null;
  quality: string | null;
  date: string;
}

interface BehaviorRecord {
  id: string;
  type: string;
  category: string;
  severity: string | null;
  description: string | null;
  date: string;
}

interface Stats {
  attendance: {
    total: number;
    hadir: number;
    terlambat: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
  totalMemorization: number;
  positiveBehavior: number;
  negativeBehavior: number;
}

export default function DetailSantriPage() {
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [memorization, setMemorization] = useState<MemorizationRecord[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/santri/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setAttendance(data.attendance);
        setMemorization(data.memorization);
        setBehaviors(data.behaviors);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [studentId]);

  const handlePrint = async (format: "pdf" | "xlsx") => {
    setPrinting(true);
    try {
      const res = await fetch(`/api/export/santri/${studentId}?format=${format}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Gagal membuat laporan");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `rekam-jejak-${studentId}.${format === "pdf" ? "pdf" : "xlsx"}`;
      const match = disposition?.match(/filename="?([^";]+)"?/);
      if (match) filename = match[1];
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`Rekam jejak berhasil diunduh (${filename})`);
    } catch (e: any) {
      toast.error(e.message ?? "Gagal membuat laporan");
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Memuat detail santri...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Link href="/manajemen/santri">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Santri tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAtt = stats?.attendance?.total ?? 0;
  const hadirAtt = stats?.attendance?.hadir ?? 0;
  const attendancePercentage = totalAtt > 0 ? Math.round((hadirAtt / totalAtt) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/manajemen/santri">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/santri/${studentId}/edit`}>Edit Data</Link>
          </Button>
          <Button variant="outline" onClick={() => handlePrint("pdf")} disabled={printing}>
            {printing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
            Cetak Rekam Jejak
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-4 md:w-64">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.photo_url ?? undefined} alt={student.full_name} />
                <AvatarFallback className="bg-primary/20 text-2xl">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="font-heading text-2xl font-bold text-secondary">{student.full_name}</h1>
                <p className="text-sm text-muted-foreground">{student.nis}</p>
                <Badge className="mt-2">{student.class_name}</Badge>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Data Pribadi</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Jenis Kelamin</p>
                      <p className="font-medium">{student.gender === "L" ? "Laki-laki" : "Perempuan"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempat, Tanggal Lahir</p>
                    <p className="font-medium text-sm">{student.birth_place}, {new Date(student.birth_date).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Alamat</p>
                      <p className="font-medium text-sm">{student.address || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Data Keluarga</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Ayah</p>
                    <p className="font-medium">{student.father_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ibu</p>
                    <p className="font-medium">{student.mother_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wali</p>
                    <p className="font-medium">{student.guardian_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{student.guardian_phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Kehadiran</p>
            <p className="text-2xl font-bold text-secondary mt-1">{attendancePercentage}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.attendance?.hadir || 0}/{stats?.attendance?.total || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Hafalan</p>
            <p className="text-2xl font-bold text-secondary mt-1">{stats?.totalMemorization || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">ayat</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Perilaku +</p>
            <p className="text-2xl font-bold text-success mt-1">{stats?.positiveBehavior || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pelanggaran</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats?.negativeBehavior || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Absensi</TabsTrigger>
          <TabsTrigger value="hafalan">Hafalan</TabsTrigger>
          <TabsTrigger value="perilaku">Perilaku</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Absensi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendance.length > 0 ? attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{new Date(record.date).toLocaleDateString("id-ID")}</p>
                    </div>
                    <Badge variant={record.status === "hadir" ? "default" : "secondary"}>
                      {record.status}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">Belum ada data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hafalan">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Hafalan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memorization.length > 0 ? memorization.map((record) => (
                  <div key={record.id} className="flex items-start justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-semibold">{record.surah_name}</p>
                      <p className="text-sm text-muted-foreground">Ayat {record.ayah_start} - {record.ayah_end}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(record.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge>{record.type}</Badge>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">Belum ada data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perilaku">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Perilaku</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {behaviors.length > 0 ? behaviors.map((record) => (
                  <div key={record.id} className="flex items-start justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{record.category}</p>
                        <Badge variant={record.type === "positif" ? "default" : "destructive"}>
                          {record.type === "positif" ? "Positif" : "Pelanggaran"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.description || "-"}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">Belum ada data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}