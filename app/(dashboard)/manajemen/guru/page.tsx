import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/lib/queries";

async function GuruContent() {
  const users = await getUsers({ role: "guru" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kinerja Guru</CardTitle>
        <CardDescription>Data kelengkapan input per guru</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Guru</TableHead>
                <TableHead>Halaqah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jurnal Mengajar</TableHead>
                <TableHead>Santri Bimbingan</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.fullName}</TableCell>
                  <TableCell>{teacher.halaqahName ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === "active" ? "default" : "secondary"}>{teacher.status}</Badge>
                  </TableCell>
                  <TableCell>{teacher.journalCount ?? 0}</TableCell>
                  <TableCell>{teacher.studentCount ?? 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/manajemen/guru/${teacher.id}`}>Lihat Detail</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Tidak ada data guru
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManajemenGuruPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat data guru...</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Monitoring Guru</h1>
          <p className="text-muted-foreground mt-1">Statistik kinerja dan kelengkapan input guru</p>
        </div>
        <GuruContent />
      </div>
    </Suspense>
  );
}