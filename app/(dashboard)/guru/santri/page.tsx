import { Suspense } from "react";
import { auth } from "@/auth";
import { getGuruHalaqahId, getStudentsByHalaqah } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

async function SantriGrid() {
  const session = await auth();
  if (!session?.user) return null;

  const guruId = (session.user as any).id as string;
  const halaqahId = await getGuruHalaqahId(guruId);

  const students = halaqahId ? await getStudentsByHalaqah(halaqahId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Santri Saya</h1>
        <p className="text-muted-foreground mt-1">
          {halaqahId
            ? `Daftar santri di level yang Anda bina (${students.length} santri)`
            : "Anda belum ditetapkan ke level manapun. Hubungi admin."}
        </p>
      </div>

      {halaqahId && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Link href={`/manajemen/santri/${student.id}`} className="block">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-lg">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.nis}</p>
                      </div>
                      <Badge variant="outline">
                        {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1 border-t pt-3">
                      <p>
                        <span className="text-muted-foreground">Jenjang:</span>{" "}
                        <span className="font-medium ml-2">{student.class_name}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Level:</span>{" "}
                        <span className="font-medium ml-2">{student.halaqah_name ?? "-"}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge variant={student.status === "aktif" ? "default" : "secondary"} className="ml-2">
                          {student.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!halaqahId && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Anda belum ditetapkan ke halaqah manapun. Hubungi admin untuk penempatan.
            </p>
          </CardContent>
        </Card>
      )}

      {halaqahId && students.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Belum ada santri di halaqah ini.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GuruSantriPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat santri...</div>}>
      <SantriGrid />
    </Suspense>
  );
}