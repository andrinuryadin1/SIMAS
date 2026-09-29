import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionUser = session.user as { id: string; email: string; name: string; role: string } | undefined;
  const userId = sessionUser?.id ?? "";
  const role = sessionUser?.role ?? "";

  // Get halaqah_id for guru
  let halaqahId: string | null = null;
  let halaqahName: string | null = null;
  let students: any[] = [];

  if (role === "guru") {
    // Match by pembina name in halaqahs table
    const byPembina = await db
      .prepare("SELECT h.id, h.name FROM halaqahs h JOIN users u ON h.pembina = u.full_name WHERE u.id = ? LIMIT 1")
      .get(userId);
    if (byPembina) {
      halaqahId = (byPembina as any).id;
      halaqahName = (byPembina as any).name;
    } else {
      // Fallback: first halaqah this guru has attendance for
      const fallback = await db
        .prepare(
          "SELECT h.id, h.name FROM halaqahs h JOIN attendance a ON a.halaqah_id = h.id WHERE a.user_id = ? GROUP BY h.id LIMIT 1"
        )
        .get(userId);
      if (fallback) {
        halaqahId = (fallback as any).id;
        halaqahName = (fallback as any).name;
      }
    }
  }

  if (halaqahId) {
    students = await db.prepare("SELECT id, nis, full_name, class_name, halaqah_name FROM students WHERE halaqah_id = ? AND status = 'aktif' ORDER BY full_name").all(halaqahId);
  }
  if (students.length === 0) {
    students = await db.prepare("SELECT id, nis, full_name, class_name, halaqah_name FROM students WHERE status = 'aktif' ORDER BY full_name LIMIT 200").all();
  }


  return NextResponse.json({
    user: {
      id: sessionUser?.id ?? "",
      email: sessionUser?.email ?? "",
      name: sessionUser?.name ?? "",
      role: sessionUser?.role ?? "",
    },
    halaqahId,
    halaqahName,
    students,
  });
}