import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Edit, Trash2, Power } from "lucide-react";
import { getUsers } from "@/lib/queries";
import { DataToolbar } from "@/components/data-toolbar";
import { RowActionMenu } from "@/components/row-action-menu";
import type { UserRole } from "@/components/auth-context";

function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, "default" | "secondary" | "outline"> = {
    admin: "default",
    guru: "secondary",
    manajemen: "outline",
  };
  return <Badge variant={variants[role] ?? "outline"} className="capitalize">{role}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">{status}</Badge>;
}

async function UsersTable({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const users = await getUsers({
    role: params.role as string,
    status: params.status as string,
    search: params.search as string,
  });

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "guru", label: "Guru" },
    { value: "manajemen", label: "Manajemen" },
  ];
  const statusOptions = [
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Kelola Pengguna</h1>
          <p className="text-muted-foreground mt-1">Kelola akun Admin, Guru, dan Manajemen</p>
        </div>
        <Link href="/admin/users/tambah">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataToolbar
            basePath="/admin/users"
            searchPlaceholder="Cari nama atau email..."
            filters={[
              { param: "role", label: "Filter Role", options: roleOptions },
              { param: "status", label: "Filter Status", options: statusOptions },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Total {users.length} pengguna aktif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell><StatusBadge status={user.status} /></TableCell>
                    <TableCell>
                      <RowActionMenu
                        actions={[
                          { kind: "link", label: "Edit", icon: <Edit className="mr-2 h-4 w-4" />, href: `/admin/users/${user.id}/edit` },
                          {
                            kind: "request",
                            label: user.status === "active" ? "Nonaktifkan" : "Aktifkan",
                            icon: <Power className="mr-2 h-4 w-4" />,
                            method: "PATCH",
                            url: `/api/users/${user.id}`,
                            body: { status: user.status === "active" ? "inactive" : "active" },
                            successMessage: "Status pengguna diperbarui",
                          },
                          {
                            kind: "request",
                            label: "Hapus",
                            icon: <Trash2 className="mr-2 h-4 w-4" />,
                            method: "DELETE",
                            url: `/api/users/${user.id}`,
                            destructive: true,
                            confirm: `Hapus pengguna ${user.fullName}?`,
                            successMessage: "Pengguna dihapus",
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Tidak ada pengguna ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="animate-pulse">Memuat...</div></div>}>
      <UsersTable searchParams={searchParams} />
    </Suspense>
  );
}