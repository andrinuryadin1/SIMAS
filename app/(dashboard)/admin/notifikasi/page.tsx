import { Suspense } from "react";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getNotifications } from "@/lib/queries";

async function NotificationsContent() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  // Admin sees all notifications
  const { notifications } = await getNotifications({ scope: "all", userId: userId ?? "" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifikasi Sistem</CardTitle>
        <CardDescription>Total {notifications.length} notifikasi terbaru</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50">
            <div className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? "bg-muted" : "bg-primary"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{notif.title}</p>
                <Badge variant="outline" className="text-xs">{notif.type}</Badge>
                {!notif.isRead && <Badge className="text-xs">Belum Dibaca</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(notif.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center text-muted-foreground py-8">Tidak ada notifikasi</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminNotifikasiPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat notifikasi...</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Log Notifikasi</h1>
          <p className="text-muted-foreground mt-1">Riwayat pengiriman in-app notification</p>
        </div>
        <NotificationsContent />
      </div>
    </Suspense>
  );
}