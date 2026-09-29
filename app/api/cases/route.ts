import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";
import { sanitizeObject, sanitizeTitle } from "@/lib/sanitize";

// ✅ Validasi Zod untuk POST kasus baru
const CreateCaseSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1, "Kategori wajib diisi").max(100),
});

export async function GET(request: NextRequest) {
  // ✅ Hanya user login yang boleh melihat kasus
  const { session, error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const studentId = searchParams.get("studentId");
  const scope = searchParams.get("scope") ?? "all";

  let query = `
    SELECT
      sc.*,
      s.full_name AS student_name,
      s.nis AS student_nis,
      s.class_name AS student_class,
      s.halaqah_name AS student_halaqah,
      s.photo_url AS student_photo,
      u.full_name AS reporter_name,
      (SELECT COUNT(*) FROM case_follow_ups cf WHERE cf.case_id = sc.id) AS follow_up_count
    FROM special_cases sc
    JOIN students s ON sc.student_id = s.id
    JOIN users u ON sc.reporter_id = u.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && status !== "all") {
    conditions.push("sc.status = ?");
    params.push(status);
  }
  if (category && category !== "all") {
    conditions.push("sc.category = ?");
    params.push(category);
  }
  if (studentId) {
    conditions.push("sc.student_id = ?");
    params.push(studentId);
  }
  // ✅ Guru hanya melihat kasus miliknya; session sudah tervalidasi di atas
  if (scope === "mine") {
    conditions.push("sc.reporter_id = ?");
    params.push((session!.user as any).id ?? "");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY sc.created_at DESC";

  const rows = await db.prepare(query).all(...params);

  const cases = rows.map((row) => ({
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentNis: row.student_nis,
    studentClass: row.student_class,
    studentHalaqah: row.student_halaqah,
    studentPhoto: row.student_photo,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    followUpCount: row.follow_up_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const summary = {
    total: cases.length,
    open: cases.filter((c) => c.status === "open").length,
    inProgress: cases.filter((c) => c.status === "in_progress").length,
    resolved: cases.filter((c) => c.status === "resolved").length,
  };

  return NextResponse.json({ cases, summary });
}

export async function POST(request: NextRequest) {
  // ✅ Guru dan admin boleh membuat kasus; manajemen hanya melihat
  const { session, error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  // ✅ Validasi payload dengan Zod
  const { data, error: parseError } = await parseBody(request, CreateCaseSchema);
  if (parseError) return parseError;

  // ✅ Sanitasi title dan description
  const cleanData = sanitizeObject(data, {
    title: "title",
    description: "text",
  } as const);

  try {
    const id = generateId("case");
    await db.prepare(`
      INSERT INTO special_cases (id, student_id, reporter_id, title, description, category, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `).run(
      id,
      cleanData.studentId,
      (session!.user as any).id as string,
      cleanData.title,
      cleanData.description ?? null,
      cleanData.category
    );

    return NextResponse.json({ id, message: "Kasus berhasil dibuat" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cases error:", err);
    return NextResponse.json({ error: "Gagal membuat kasus" }, { status: 500 });
  }
}
