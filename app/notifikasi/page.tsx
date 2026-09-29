import { Suspense } from "react";
import { auth } from "@/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";
import { getNotifications } from "@/lib/queries";

function NotificationCard({ notif }: { notif: any }) {
  return (
    <Card className={notif.isRead ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${
              notif.isRead ? "bg-muted" : "bg-primary"
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-semibold">{notif.title}</p>
              {!notif.isRead && <Badge className="text-xs">Baru</Badge>}
              <Badge variant="outline" className="text-xs">{notif.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(notif.createdAt)}
            </p>
          </div>
          {notif.linkUrl && (
            <Button asChild variant="outline" size="sm">
              <Link href={notif.linkUrl}>Buka</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function NotificationCenter() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const { notifications, unreadCount } = await getNotifications({ userId });
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <Tabs defaultValue="unread" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="unread">Belum Dibaca ({unreadCount})</TabsTrigger>
        <TabsTrigger value="all">Semua ({notifications.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="unread" className="space-y-4 mt-4">
        {unread.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Tidak ada notifikasi belum dibaca</p>
            </CardContent>
          </Card>
        ) : (
          unread.map((notif: any) => <NotificationCard key={notif.id} notif={notif} />)
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-4 mt-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Belum ada notifikasi</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif: any) => <NotificationCard key={notif.id} notif={notif} />)
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function NotifikasiPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-secondary">Pusat Notifikasi</h1>
        <p className="text-muted-foreground mt-1">Kelola semua notifikasi dan pengumuman sistem</p>
      </div>
      <Suspense fallback={<div className="flex h-64 items-center justify-center">Memuat notifikasi...</div>}>
        <NotificationCenter />
      </Suspense>
    </div>
  );
}