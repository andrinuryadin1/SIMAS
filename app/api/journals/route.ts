import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";
import { sanitizeObject } from "@/lib/sanitize";

const JournalSchema = z.object({
  halaqahId: z.string().optional(),
  subject: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  topic: z.string().min(3, "Topik minimal 3 karakter").max(300),
  method: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  obstacles: z.string().max(1000).optional(),
  reflection: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  const { session, error } = await getSessionOrError();
  if (error) return error;

  const userRole = (session!.user as any).role as string;
  const userId = (session!.user as any).id as string;

  const { searchParams } = new URL(request.url);
  const halaqahId = searchParams.get("halaqahId");
  const date = searchParams.get("date");
  const subject = searchParams.get("subject");
  // Guru hanya bisa lihat jurnal miliknya; manajemen & admin bisa filter by userId
  const filterUserId = userRole === "guru"
    ? userId
    : (searchParams.get("userId") ?? undefined);

  let query = `
    SELECT j.*, u.full_name as user_name
    FROM teaching_journals j
    JOIN users u ON j.user_id = u.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filterUserId) { conditions.push("j.user_id = ?");    params.push(filterUserId); }
  if (date)         { conditions.push("j.date = ?");        params.push(date); }
  if (halaqahId)    { conditions.push("j.halaqah_id = ?");  params.push(halaqahId); }
  if (subject)      { conditions.push("j.subject = ?");     params.push(subject); }

  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY j.date DESC, j.created_at DESC";

  const journals = await db.prepare(query).all(...params);
  return NextResponse.json(journals);
}

export async function POST(request: NextRequest) {
  // Hanya guru yang bisa isi jurnal mengajar
  const { session, error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, JournalSchema);
  if (parseError) return parseError;

  // Sanitasi rich text fields (summary, obstacles, reflection)
  const cleanData = sanitizeObject(data, {
    summary: "rich",
    obstacles: "rich",
    reflection: "rich",
  } as const);

  const userId = (session!.user as any).id as string;

  try {
    const id = generateId("jrn");
    await db.prepare(`
      INSERT INTO teaching_journals (id, user_id, halaqah_id, subject, date, topic, method, summary, obstacles, reflection)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, cleanData.halaqahId ?? null, cleanData.subject ?? null, cleanData.date,
      cleanData.topic, cleanData.method ?? null, cleanData.summary ?? null,
      cleanData.obstacles ?? null, cleanData.reflection ?? null
    );
    return NextResponse.json({ id, message: "Jurnal mengajar berhasil disimpan" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan jurnal mengajar" }, { status: 500 });
  }
}