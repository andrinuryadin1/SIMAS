"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/**
 * Serializable action descriptor.
 *
 * Server Components cannot pass functions to Client Components, so actions are
 * described as plain data and executed here (navigation or fetch + refresh).
 */
export type RowAction =
  | { kind: "link"; label: string; href: string; icon?: React.ReactNode }
  | { kind: "callback"; label: string; icon?: React.ReactNode; onClick: () => void }
  | {
      kind: "request";
      label: string;
      icon?: React.ReactNode;
      method: "POST" | "PATCH" | "PUT" | "DELETE";
      url: string;
      body?: Record<string, unknown>;
      confirm?: string;
      successMessage?: string;
      destructive?: boolean;
    };

export interface RowActionMenuProps {
  actions: RowAction[];
}

export function RowActionMenu({ actions }: RowActionMenuProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const runRequest = async (action: Extract<RowAction, { kind: "request" }>) => {
    if (action.confirm && !window.confirm(action.confirm)) return;
    setBusy(true);
    try {
      const res = await fetch(action.url, {
        method: action.method,
        headers: { "Content-Type": "application/json" },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Gagal menyimpan perubahan");
        return;
      }
      toast.success(action.successMessage ?? "Berhasil disimpan");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={busy} aria-label="Aksi baris">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => {
          const destructive = action.kind === "request" && action.destructive;
          return (
            <React.Fragment key={`${action.label}-${index}`}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={`text-sm ${destructive ? "text-destructive" : ""}`}
                disabled={busy}
                onSelect={(event) => {
                  if (action.kind === "link") {
                    event.preventDefault();
                    router.push(action.href);
                    return;
                  }
                  if (action.kind === "request") {
                    event.preventDefault();
                    void runRequest(action);
                    return;
                  }
                  action.onClick();
                }}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
