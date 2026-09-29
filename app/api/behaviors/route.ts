import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";
import { sanitizeObject } from "@/lib/sanitize";

// ✅ Validasi Zod untuk POST catatan perilaku
const BehaviorSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  type: z.enum(["positif", "pelanggaran"]),
  category: z.string().min(1, "Kategori wajib diisi").max(100),
  severity: z.enum(["ringan", "sedang", "berat"]).optional(),
  description: z.string().max(1000).optional(),
  actionTaken: z.string().max(1000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
}).refine(
  (d) => d.type === "positif" || d.severity !== undefined,
  {
    message: "Tingkat keparahan wajib diisi untuk catatan pelanggaran",
    path: ["severity"],
  }
);

export async function GET(request: NextRequest) {
  // ✅ Hanya user login yang boleh melihat catatan perilaku
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const type = searchParams.get("type");

  let query =
    "SELECT b.*, s.full_name as student_name, s.nis FROM behaviors b JOIN students s ON b.student_id = s.id";
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (studentId) {
    conditions.push("b.student_id = ?");
    params.push(studentId);
  }
  if (type) {
    conditions.push("b.type = ?");
    params.push(type);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY b.date DESC, b.created_at DESC";

  const behaviors = db.prepare(query).all(...params);
  return NextResponse.json(behaviors);
}

export async function POST(request: NextRequest) {
  // ✅ Hanya guru dan admin yang boleh mencatat perilaku
  const { session, error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  // ✅ Validasi payload dengan Zod
  const { data, error: parseError } = await parseBody(request, BehaviorSchema);
  if (parseError) return parseError;

  // ✅ Sanitasi input teks bebas
  const cleanData = sanitizeObject(data, {
    description: "text",
    actionTaken: "text",
  } as const);

  const userId = (session!.user as any).id as string;

  try {
    const id = generateId("beh");
    db.prepare(`
      INSERT INTO behaviors (id, student_id, user_id, type, category, severity, description, action_taken, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanData.studentId,
      userId,
      cleanData.type,
      cleanData.category,
      cleanData.severity ?? null,
      cleanData.description ?? null,
      cleanData.actionTaken ?? null,
      cleanData.date
    );

    return NextResponse.json({ id, message: "Catatan perilaku berhasil disimpan" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan catatan perilaku" }, { status: 500 });
  }
}