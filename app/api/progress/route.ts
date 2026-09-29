import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";
import { sanitizeText } from "@/lib/sanitize";

const ProgressSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  subjectCategory: z.string().min(1, "Kategori wajib diisi"),
  aspectName: z.string().min(1, "Nama aspek wajib diisi").max(150),
  period: z.string().min(1, "Periode wajib diisi").max(50),
  level: z.string().min(1, "Level capaian wajib diisi"),
  score: z.number().int().min(0).max(100).optional(),
  note: z.string().max(500).optional(),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export async function GET(request: NextRequest) {
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const subjectCategory = searchParams.get("subjectCategory");
  const period = searchParams.get("period");
  const userId = searchParams.get("userId");

  let query = `
    SELECT p.*, s.full_name as student_name, s.nis
    FROM progress_records p
    JOIN students s ON p.student_id = s.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (studentId)       { conditions.push("p.student_id = ?");       params.push(studentId); }
  if (subjectCategory) { conditions.push("p.subject_category = ?"); params.push(subjectCategory); }
  if (period)          { conditions.push("p.period = ?");            params.push(period); }
  if (userId)          { conditions.push("p.user_id = ?");           params.push(userId); }

  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY p.recorded_at DESC, p.created_at DESC";

  return NextResponse.json(await db.prepare(query).all(...params));
}

export async function POST(request: NextRequest) {
  const { session, error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, ProgressSchema);
  if (parseError) return parseError;

  const userId = (session!.user as any).id as string;

  // ✅ Sanitasi note
  const cleanNote = sanitizeText(data.note);

  try {
    const existing = await db.prepare(
      "SELECT id FROM progress_records WHERE student_id = ? AND aspect_name = ? AND period = ?"
    ).get(data.studentId, data.aspectName, data.period) as { id: string } | undefined;

    if (existing) {
      await db.prepare(`
        UPDATE progress_records
        SET user_id = ?, subject_category = ?, level = ?, score = ?, note = ?, recorded_at = ?
        WHERE id = ?
      `).run(
        userId, data.subjectCategory, data.level, data.score ?? null, cleanNote ?? null, data.recordedAt, existing.id
      );
      return NextResponse.json({ id: existing.id, message: "Perkembangan berhasil diperbarui" });
    } else {
      const id = generateId("prog");
      await db.prepare(`
        INSERT INTO progress_records
          (id, student_id, user_id, subject_category, aspect_name, period, level, score, note, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.studentId, userId, data.subjectCategory, data.aspectName,
        data.period, data.level, data.score ?? null, cleanNote ?? null, data.recordedAt
      );
      return NextResponse.json({ id, message: "Perkembangan berhasil disimpan" }, { status: 201 });
    }
  } catch (err) {
    console.error("POST /api/progress error:", err);
    return NextResponse.json({ error: "Gagal menyimpan perkembangan" }, { status: 500 });
  }
}