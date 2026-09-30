"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationBellProps {
  role: "admin" | "guru" | "manajemen";
}

/**
 * Ikon lonceng di header dengan badge jumlah notifikasi BELUM DIBACA.
 *
 * Angka diambil dari `GET /api/notifications` yang sudah menghitung unread
 * berdasarkan sesi login (bukan angka hardcoded), lalu di-refresh tiap menit
 * supaya badge tidak basi.
 */
export function NotificationBell({ role }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const loadUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.unreadCount === "number") setUnreadCount(data.unreadCount);
    } catch {
      // Lonceng tetap tampil apa adanya kalau API gagal.
    }
  }, []);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 60_000);
    return () => clearInterval(interval);
  }, [loadUnread]);

  return (
    <Link href={`/${role}/notifikasi`} title="Notifikasi">
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative text-slate-700 hover:text-slate-950 hover:bg-slate-100"
        aria-label={
          unreadCount && unreadCount > 0
            ? `Notifikasi, ${unreadCount} belum dibaca`
            : "Notifikasi"
        }
      >
        <Bell className="size-4.5" />
        {unreadCount !== null && unreadCount > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5 size-4.5 min-w-4.5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full bg-rose-600 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
