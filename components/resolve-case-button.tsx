"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ResolveCaseButton({ caseId, caseTitle }: { caseId: string; caseTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    if (!window.confirm(`Tandai kasus "${caseTitle}" sebagai selesai?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memperbarui kasus");
      toast.success("Kasus ditandai selesai");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Gagal memperbarui kasus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleResolve} disabled={loading}>
      <CheckCircle2 className="mr-2 h-4 w-4" />
      {loading ? "Memproses..." : "Tandai Selesai"}
    </Button>
  );
}