import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export default function AksesDitolakPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-destructive/5 to-accent/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-heading">Akses Ditolak</CardTitle>
          <CardDescription>403 Forbidden</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi
            Administrator jika Anda merasa ini adalah kesalahan.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full" variant="default">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full" variant="outline">
                Ke Halaman Utama
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Jika Anda memerlukan bantuan, hubungi:{" "}
            <a
              href="mailto:admin@kuttabal-fatih.sch.id"
              className="text-primary hover:underline"
            >
              admin@kuttabal-fatih.sch.id
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
