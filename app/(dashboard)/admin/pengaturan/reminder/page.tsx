"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPengaturanReminderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: "thursday",
    time: "14:00",
    timezone: "Asia/Jakarta",
    message: "Assalamu'alaikum Ustadz/Ustadzah, mohon lengkapi input perkembangan santri pekan ini.",
    isActive: true,
  });
  const [lastSent, setLastSent] = useState<string>("Belum pernah");
  const [nextScheduled, setNextScheduled] = useState<string>("-");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/reminder-settings");
      if (res.ok) {
        const data = await res.json();
        setForm(data);
      }
    } catch {
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reminder-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Gagal menyimpan");
        return;
      }
      toast.success("Pengaturan reminder berhasil disimpan");
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Pengaturan Reminder Mingguan</h1>
        <p className="text-muted-foreground mt-1">Konfigurasi jadwal reminder untuk Guru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jadwal Reminder</CardTitle>
          <CardDescription>Atur hari dan jam pengiriman reminder mingguan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Hari</Label>
              <Select
                value={form.dayOfWeek}
                onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Senin</SelectItem>
                  <SelectItem value="tuesday">Selasa</SelectItem>
                  <SelectItem value="wednesday">Rabu</SelectItem>
                  <SelectItem value="thursday">Kamis</SelectItem>
                  <SelectItem value="friday">Jumat</SelectItem>
                  <SelectItem value="saturday">Sabtu</SelectItem>
                  <SelectItem value="sunday">Minggu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Jam</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Zona Waktu</Label>
            <Select
              value={form.timezone}
              onValueChange={(v) => setForm({ ...form, timezone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok (ICT)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Template Pesan</Label>
            <textarea
              id="message"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Template pesan reminder..."
            />
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Aktifkan reminder mingguan
            </Label>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Jadwal Saat Ini:</strong>{" "}
            Setiap {form.dayOfWeek} pukul {form.time} {form.timezone === "Asia/Jakarta" ? "WIB" : form.timezone}
          </p>
          <p className="text-sm text-blue-900">
            <strong>Reminder Terakhir Dikirim:</strong> {lastSent}
          </p>
          <p className="text-sm text-blue-900">
            <strong>Reminder Berikutnya:</strong> {nextScheduled}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}