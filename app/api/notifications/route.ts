import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";

function serializeNotification(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    linkUrl: row.link_url,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
    userName: row.user_name,
  };
}

const CreateNotifSchema = z.object({
  userId: z.string().min(1, "userId wajib diisi"),
  type: z.string().min(1, "type wajib diisi"),
  title: z.string().min(1, "title wajib diisi").max(200),
  message: z.string().max(1000).optional().nullable(),
  linkUrl: z.string().max(500).optional().nullable(),
});

export async function GET(request: NextRequest) {
  const { session, error } = await getSessionOrError();
  if (error) return error;

  const user = session!.user as { id: string; role?: string };
  const { searchParams } = new URL(request.url);
  const requestedScope = searchParams.get("scope") ?? "mine";
  const isRead = searchParams.get("isRead");

  // "all" hanya diizinkan untuk admin
  const scope = requestedScope === "all" && user.role === "admin" ? "all" : "mine";

  let query = `
    SELECT n.*, u.full_name AS user_name
    FROM notifications n
    JOIN users u ON n.user_id = u.id
  `;
  const conditions: string[] = [];
  const params: any[] = [];

  if (scope !== "all") {
    conditions.push("n.user_id = ?");
    params.push(user.id);
  }
  if (isRead === "true" || isRead === "false") {
    conditions.push("n.is_read = ?");
    params.push(isRead === "true" ? 1 : 0);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY n.is_read ASC, n.created_at DESC";

  const rows = await db.prepare(query).all(...params);
  const notifications = rows.map(serializeNotification);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await getSessionOrError();
    if (error) return error;

    const userId = (session!.user as { id: string }).id;
    const body = await request.json();
    const { id, all } = body;

    if (all) {
      await db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
      return NextResponse.json({ message: "Semua notifikasi ditandai sudah dibaca" });
    }

    if (!id) {
      return NextResponse.json({ error: "ID notifikasi diperlukan" }, { status: 400 });
    }

    await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(id, userId);
    return NextResponse.json({ message: "Notifikasi ditandai sudah dibaca" });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Hanya admin dan guru yang boleh mengirim notifikasi
  const { error: authError } = await getSessionOrError(["admin", "guru"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, CreateNotifSchema);
  if (parseError) return parseError;

  try {
    const id = generateId("notif");
    await db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link_url, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, data.userId, data.type, data.title, data.message ?? null, data.linkUrl ?? null);

    return NextResponse.json({ id, message: "Notifikasi berhasil dibuat" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "Gagal membuat notifikasi" }, { status: 500 });
  }
}
