import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Calendar, BookOpen } from "lucide-react";
import { getUsers } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/utils";

async function GuruDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const users = await getUsers({ role: "guru" });
  const guru = users.find((u) => u.id === id);

  if (!guru) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/manajemen/guru">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-4 md:w-64">
              <Avatar className="h-32 w-32">
                <AvatarImage src={guru.avatarUrl ?? undefined} alt={guru.fullName} />
                <AvatarFallback className="bg-primary/20 text-2xl">
                  {guru.fullName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="font-heading text-2xl font-bold text-secondary">{guru.fullName}</h1>
                <p className="text-sm text-muted-foreground">{guru.email}</p>
                <Badge className="mt-2 capitalize">{guru.role}</Badge>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Data Profil</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{guru.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bergabung</p>
                      <p className="font-medium text-sm">{new Date(guru.createdAt).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Halaqah Binaan</p>
                      <p className="font-medium text-sm">{guru.halaqahName ?? "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Kinerja</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg border">
                    <p className="text-2xl font-bold text-primary">{guru.journalCount}</p>
                    <p className="text-xs text-muted-foreground">Jurnal Mengajar</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border">
                    <p className="text-2xl font-bold text-secondary">{guru.studentCount}</p>
                    <p className="text-xs text-muted-foreground">Santri Bimbingan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Journals */}
      <Card>
        <CardHeader>
          <CardTitle>Jurnal Mengajar Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">Data jurnal akan ditampilkan di sini</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManajemenGuruDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat detail guru...</div>}>
      <GuruDetailContent params={params} />
    </Suspense>
  );
}