import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Power, Upload } from "lucide-react";
import { getStudents, getClassOptions, getHalaqahOptions } from "@/lib/queries";
import { DataToolbar } from "@/components/data-toolbar";
import { RowActionMenu } from "@/components/row-action-menu";
import { AdminSantriActions } from "@/components/admin/santri-actions";

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "aktif" ? "default" : "secondary"} className="capitalize">{status}</Badge>;
}

async function SantriTable({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const students = (await getStudents({
    classId: params.classId as string,
    halaqahId: params.halaqahId as string,
  })).filter((s) => {
    const search = (params.search as string)?.toLowerCase() ?? "";
    if (search && !s.full_name.toLowerCase().includes(search) && !s.nis.includes(search)) return false;
    if (params.status && s.status !== params.status) return false;
    return true;
  });

  const classOptions = (await getClassOptions()).map((c) => ({ value: c.id, label: c.name }));
  const halaqahOptions = (await getHalaqahOptions()).map((h) => ({ value: h.id, label: h.name }));
  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "nonaktif", label: "Nonaktif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Kelola Santri</h1>
          <p className="text-muted-foreground mt-1">Kelola data santri, penempatan jenjang dan level</p>
        </div>
        <Button asChild>
          <Link href="/admin/santri/tambah">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Santri
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="hidden sm:block"
          aria-label="Import data santri"
          title="Import Data Santri"
        >
          <Upload className="h-4 w-4" />
        </Button>
        {/* Import Modal akan muncul di sini */}
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataToolbar
            basePath="/admin/santri"
            searchPlaceholder="Cari nama atau NIS..."
            filters={[
              { param: "classId", label: "Filter Jenjang", options: classOptions },
              { param: "halaqahId", label: "Filter Level", options: halaqahOptions },
              { param: "status", label: "Filter Status", options: statusOptions },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>Total {students.length} santri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenjang</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.nis}</TableCell>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.class_name}</TableCell>
                    <TableCell>{student.halaqah_name ?? "-"}</TableCell>
                    <TableCell><StatusBadge status={student.status} /></TableCell>
                    <TableCell>
                      <RowActionMenu
                        actions={[
                          { kind: "link", label: "Lihat Detail", icon: <Eye className="mr-2 h-4 w-4" />, href: `/manajemen/santri/${student.id}` },
                          { kind: "link", label: "Edit", icon: <Edit className="mr-2 h-4 w-4" />, href: `/admin/santri/${student.id}/edit` },
                          {
                            kind: "request",
                            label: student.status === "aktif" ? "Nonaktifkan" : "Aktifkan",
                            icon: <Power className="mr-2 h-4 w-4" />,
                            method: "PATCH",
                            url: `/api/santri/${student.id}`,
                            body: { status: student.status === "aktif" ? "nonaktif" : "aktif" },
                            successMessage: "Status santri diperbarui",
                          },
                          {
                            kind: "request",
                            label: "Hapus",
                            icon: <Trash2 className="mr-2 h-4 w-4" />,
                            method: "DELETE",
                            url: `/api/santri/${student.id}`,
                            destructive: true,
                            confirm: `Hapus santri ${student.full_name}?`,
                            successMessage: "Santri dihapus",
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Tidak ada santri ditemukan
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

export default async function AdminSantriPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="animate-pulse">Memuat...</div></div>}>
      <SantriTable searchParams={searchParams} />
      <AdminSantriActions />
    </Suspense>
  );
}