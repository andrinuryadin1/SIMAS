"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminTambahPenggunaPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Tambah Pengguna Baru</h1>
        <p className="text-muted-foreground mt-1">Isi formulir di bawah untuk menambahkan pengguna baru</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Data Pengguna</CardTitle>
          <CardDescription>Informasi akun yang akan dibuat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" placeholder="Nama Lengkap" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@contoh.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="guru">Guru</SelectItem>
                  <SelectItem value="manajemen">Manajemen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input id="phone" placeholder="08XXXXXXXXX" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea id="notes" placeholder="Catatan tambahan tentang pengguna ini" />
          </div>

          <div className="flex gap-4">
            <Button>Buat Akun</Button>
            <Button variant="outline">Batal</Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Catatan:</strong> Password sementara akan dikirimkan ke email pengguna. Pengguna diminta untuk mengganti password saat login pertama.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
