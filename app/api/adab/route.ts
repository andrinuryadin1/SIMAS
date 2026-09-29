import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";
import { sanitizeText } from "@/lib/sanitize";

// ✅ Validasi Zod — skor 1–4 (skala pesantren umum)
const scoreField = z.number().int().min(1).max(4).optional();

const AdabSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  period: z.string().min(1, "Periode wajib diisi").max(50),
  scoreHonesty: scoreField,
  scoreIndependence: scoreField,
  scoreSocial: scoreField,
  scoreCleanliness: scoreField,
  scoreDiscipline: scoreField,
  note: z.string().max(500).optional(),
}).refine(
  (d) =>
    [d.scoreHonesty, d.scoreIndependence, d.scoreSocial, d.scoreCleanliness, d.scoreDiscipline]
      .some((s) => s !== undefined),
  { message: "Minimal satu aspek penilaian harus diisi" }
);

export async function GET(request: NextRequest) {
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const period = searchParams.get("period");
  const userId = searchParams.get("userId");

  let query = `
    SELECT a.*, s.full_name as student_name, s.nis
    FROM adab_assessments a
    JOIN students s ON a.student_id = s.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (studentId) { conditions.push("a.student_id = ?"); params.push(studentId); }
  if (period)    { conditions.push("a.period = ?");     params.push(period); }
  if (userId)    { conditions.push("a.user_id = ?");    params.push(userId); }

  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY a.date DESC, a.created_at DESC";

  return NextResponse.json(db.prepare(query).all(...params));
}

export async function POST(request: NextRequest) {
  const { session, error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, AdabSchema);
  if (parseError) return parseError;

  const userId = (session!.user as any).id as string;

  const scores = [
    data.scoreHonesty, data.scoreIndependence, data.scoreSocial,
    data.scoreCleanliness, data.scoreDiscipline,
  ].filter((v): v is number => v !== undefined);
  const averageScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
    : null;

  // Sanitasi note
  const cleanNote = sanitizeText(data.note);

  try {
    const id = generateId("adab");
    db.prepare(`
      INSERT INTO adab_assessments
        (id, student_id, user_id, date, period, score_honesty, score_independence,
         score_social, score_cleanliness, score_discipline, average_score, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.studentId, userId, data.date, data.period,
      data.scoreHonesty ?? null, data.scoreIndependence ?? null,
      data.scoreSocial ?? null, data.scoreCleanliness ?? null,
      data.scoreDiscipline ?? null, averageScore, cleanNote ?? null
    );
    return NextResponse.json({ id, averageScore, message: "Penilaian adab berhasil disimpan" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan penilaian adab" }, { status: 500 });
  }
}