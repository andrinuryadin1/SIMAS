import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { getCases, CaseRow } from "@/lib/queries";
import { ResolveCaseButton } from "@/components/resolve-case-button";

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  open: { label: "Terbuka", variant: "outline" },
  in_progress: { label: "Berlangsung", variant: "secondary" },
  resolved: { label: "Selesai", variant: "default" },
};

function CaseCard({ item }: { item: CaseRow }) {
  const status = STATUS_META[item.status] ?? STATUS_META.open;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm shrink-0">
              {item.studentName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/manajemen/santri/${item.studentId}`}
                  className="font-semibold text-lg hover:text-primary hover:underline"
                >
                  {item.studentName}
                </Link>
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge variant="outline" className="capitalize">{item.category}</Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono">{item.studentNis}</span>
                <span>{item.studentClass}</span>
                {item.studentHalaqah && <span>{item.studentHalaqah}</span>}
                <span>Dilaporkan oleh {item.reporterName}</span>
              </p>
              <p className="mt-3 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/guru/kasus/${item.id}`}>Tindak Lanjut ({item.followUpCount})</Link>
          </Button>
          {item.status !== "resolved" && (
            <ResolveCaseButton caseId={item.id} caseTitle={item.title} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function CasesContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const { cases, summary } = await getCases({
    status: params.status as string,
    category: params.category as string,
    search: params.q as string,
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Kasus</p>
          <p className="text-2xl font-bold text-secondary">{summary.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Terbuka</p>
          <p className="text-2xl font-bold text-warning">{summary.open}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Berlangsung</p>
          <p className="text-2xl font-bold text-secondary">{summary.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Selesai</p>
          <p className="text-2xl font-bold text-primary">{summary.resolved}</p>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button asChild variant={params.status === "open" ? "default" : "outline"} size="sm">
                <Link href="/manajemen/kasus?status=open">Terbuka ({summary.open})</Link>
              </Button>
              <Button asChild variant={params.status === "in_progress" ? "default" : "outline"} size="sm">
                <Link href="/manajemen/kasus?status=in_progress">Berlangsung ({summary.inProgress})</Link>
              </Button>
              <Button asChild variant={params.status === "resolved" ? "default" : "outline"} size="sm">
                <Link href="/manajemen/kasus?status=resolved">Selesai ({summary.resolved})</Link>
              </Button>
              {params.status && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/manajemen/kasus">Reset</Link>
                </Button>
              )}
            </div>
            <Input
              placeholder="Cari kasus atau nama santri..."
              defaultValue={(params.q as string) || ""}
              className="min-w-[16rem] flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = new URL(window.location.href);
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) url.searchParams.set("q", v); else url.searchParams.delete("q");
                  window.location.href = url.toString();
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {cases.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
        {cases.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium">Tidak ada kasus</p>
              <p className="text-sm text-muted-foreground">
                Belum ada kasus-recorded untuk filter yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default function ManajemenKasusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Monitoring Kasus</h1>
        <p className="text-muted-foreground mt-1">Pantau seluruh kasus khusus santri lintas kelas</p>
      </div>
      <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat kasus...</div>}>
        <CasesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}