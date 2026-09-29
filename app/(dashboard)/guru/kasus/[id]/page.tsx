"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";

interface CaseDetail {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: {
    fullName: string;
    nis: string;
    className: string;
    halaqahName: string | null;
  };
  reporterName: string;
  followUpNotes: { id: string; by: string; at: string; note: string }[];
}

export default function GuruKasusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    fetch(`/api/cases/${id}`).then((r) => r.json()).then(setCaseDetail).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async () => {
    const newStatus = status || "resolved";
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      toast.success("Status diperbarui");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!note) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Gagal menambah catatan");
      toast.success("Catatan ditambahkan");
      setNote("");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center">Memuat...</div>;
  if (!caseDetail) return <div className="p-8 text-center text-muted-foreground">Kasus tidak ditemukan</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{caseDetail.title}</CardTitle>
          <CardDescription>{caseDetail.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Santri:</strong> {caseDetail.student.fullName} ({caseDetail.student.nis}) - {caseDetail.student.className}</p>
          <p><strong>Kategori:</strong> {caseDetail.category}</p>
          <p><strong>Status:</strong> {caseDetail.status}</p>
          <p><strong>Lapor:</strong> {caseDetail.reporterName} ({formatRelativeTime(caseDetail.createdAt)})</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tindakan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Ubah status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Terbuka</SelectItem>
              <SelectItem value="in_progress">Berlangsung</SelectItem>
              <SelectItem value="resolved">Selesai</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleStatusChange} disabled={saving}>Ubah Status</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catatan Follow‑Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {caseDetail.followUpNotes.map((n) => (
            <div key={n.id} className="border p-2 rounded">
              <p>{n.note}</p>
              <p className="text-xs text-muted-foreground">{n.by} - {formatRelativeTime(n.at)}</p>
            </div>
          ))}
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambah catatan..." rows={3} />
          <Button onClick={handleAddNote} disabled={saving}>Tambah Catatan</Button>
        </CardContent>
      </Card>
    </div>
  );
}