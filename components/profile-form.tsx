"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  heading?: string;
  description?: string;
  roleLabel?: string;
  isAdmin?: boolean;
}

export function ProfileForm({ heading = "Profil Saya", description = "Kelola informasi profil pribadi Anda", roleLabel = "user", isAdmin = false }: ProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setForm({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          role: data.role ?? roleLabel,
        });
      } else if (res.status === 401) {
        toast.error("Unauthorized - silakan login ulang");
      } else {
        toast.error("Gagal memuat profil");
      }
    } catch {
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleProfileSubmit = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) toast.error((data as { error?: string }).error ?? "Gagal menyimpan");
      else {
        toast.success("Profil berhasil diperbarui");
        setHasSaved(true);
        void load();
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.oldPassword.length < 1 || passwordForm.newPassword.length < 1) {
      toast.error("Isi semua field password");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) toast.error((data as { error?: string }).error ?? "Gagal ubah password");
      else {
        toast.success("Password berhasil diubah");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setChangingPassword(false);
        void load();
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">{heading}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Edit data profil {roleLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                disabled
                defaultValue={form.role}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleProfileSubmit} disabled={loading}>
              Simpan Perubahan
            </Button>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Update password keamanan akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Password Lama</Label>
            <Input
              id="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handlePasswordSubmit} disabled={changingPassword || loading}>
              {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ubah Password
            </Button>
            <Button variant="outline" onClick={() => setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })} disabled={loading}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSaved && (
        <div className="border-green-200 bg-green-50 p-4 rounded-md text-green-900 text-sm">
          <strong>✅ Profil berhasil disimpan!</strong>
        </div>
      )}
    </div>
  );
}