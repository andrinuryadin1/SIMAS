import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { getCases } from "@/lib/queries";

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  open: { label: "Terbuka", variant: "outline" },
  in_progress: { label: "Berlangsung", variant: "secondary" },
  resolved: { label: "Selesai", variant: "default" },
};

function CaseCard({ item }: { item: any }) {
  const status = STATUS_META[item.status] ?? STATUS_META.open;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/guru/kasus/${item.id}`} className="hover:underline">
                <p className="font-semibold text-lg">{item.title}</p>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Kategori: <span className="font-medium capitalize">{item.category}</span></span>
            <span>Santri: <span className="font-medium">{item.studentName}</span></span>
            <span>Kelas: <span className="font-medium">{item.studentClass}</span></span>
            {item.studentHalaqah && <span>Halaqah: <span className="font-medium">{item.studentHalaqah}</span></span>}
            <span>Dilaporkan: <span className="font-medium">{formatRelativeTime(item.createdAt)}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function CasesContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const { cases, summary } = await getCases({
    status: params.status as string,
    search: params.q as string,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Riwayat Khusus (Kasus)</h1>
          <p className="text-muted-foreground mt-1">Lapor dan pantau kasus khusus santri</p>
        </div>
        <Button asChild>
          <Link href="/guru/kasus/baru">+ Lapor Kasus Baru</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button asChild variant={params.status === "open" ? "default" : "outline"} size="sm">
                <Link href="/guru/kasus?status=open">Terbuka ({summary.open})</Link>
              </Button>
              <Button asChild variant={params.status === "in_progress" ? "default" : "outline"} size="sm">
                <Link href="/guru/kasus?status=in_progress">Berlangsung ({summary.inProgress})</Link>
              </Button>
              <Button asChild variant={params.status === "resolved" ? "default" : "outline"} size="sm">
                <Link href="/guru/kasus?status=resolved">Selesai ({summary.resolved})</Link>
              </Button>
              {params.status && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/guru/kasus">Reset</Link>
                </Button>
              )}
            </div>
            <Input
              placeholder="Cari kasus..."
              value={(params.q as string) || ""}
              onChange={(e) => {
                const url = new URL(window.location.href);
                const v = e.target.value.trim();
                if (v) url.searchParams.set("q", v); else url.searchParams.delete("q");
                window.history.pushState({}, "", url);
              }}
              className="min-w-[16rem] flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {cases.map((item: any) => (
          <CaseCard key={item.id} item={item} />
        ))}
        {cases.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada kasus untuk filter yang dipilih.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function GuruKasusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat kasus...</div>}>
      <CasesContent searchParams={searchParams} />
    </Suspense>
  );
}