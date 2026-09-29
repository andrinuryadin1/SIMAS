import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, type InValue } from "@libsql/client";
import { getSessionOrError, generateId } from "@/lib/api-utils";
import { sanitizeText } from "@/lib/sanitize";

const SingleAttendanceSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  userId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  status: z.enum(["hadir", "terlambat", "sakit", "izin", "alpha"]),
  halaqahId: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const BatchAttendanceSchema = z.object({
  records: z.array(SingleAttendanceSchema).min(1, "Daftar absensi tidak boleh kosong"),
});

export async function GET(request: NextRequest) {
  // Hanya user yang sudah login yang boleh akses
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const halaqahId = searchParams.get("halaqahId");
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let query =
    "SELECT a.*, s.full_name as student_name, s.nis, s.class_name FROM attendance a JOIN students s ON a.student_id = s.id";
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (studentId) {
    conditions.push("a.student_id = ?");
    params.push(studentId);
  }
  if (halaqahId && halaqahId !== "all") {
    conditions.push("a.halaqah_id = ?");
    params.push(halaqahId);
  }
  if (startDate && endDate) {
    conditions.push("a.date BETWEEN ? AND ?");
    params.push(startDate, endDate);
  } else if (startDate) {
    conditions.push("a.date >= ?");
    params.push(startDate);
  } else if (date) {
    conditions.push("a.date = ?");
    params.push(date);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY a.date DESC, a.created_at DESC";

  // gunakan client langsung untuk query sederhana
  const client = createClient({ url: process.env.TURSO_DATABASE_URL || "file:data/simas.db", authToken: process.env.TURSO_AUTH_TOKEN });
  const result = await client.execute({ sql: query, args: params as InValue[] });
  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  // Hanya guru dan admin yang boleh mencatat absensi
  const { session, error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  const sessionUserId = (session!.user as any)?.id as string;

  try {
    const rawBody = await request.json();
    let recordsToSave: z.infer<typeof SingleAttendanceSchema>[] = [];

    // Support: array of records, { records: [...] }, or single record
    if (Array.isArray(rawBody)) {
      const parsed = z.array(SingleAttendanceSchema).safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Format data tidak valid" }, { status: 400 });
      }
      recordsToSave = parsed.data;
    } else if (rawBody && Array.isArray(rawBody.records)) {
      const parsed = BatchAttendanceSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Format data tidak valid" }, { status: 400 });
      }
      recordsToSave = parsed.data.records;
    } else {
      const parsed = SingleAttendanceSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Format data tidak valid" }, { status: 400 });
      }
      recordsToSave = [parsed.data];
    }

    const client = createClient({ url: process.env.TURSO_DATABASE_URL || "file:data/simas.db", authToken: process.env.TURSO_AUTH_TOKEN });
    let savedCount = 0;
    for (const rec of recordsToSave) {
      const id = generateId("att");
      const userId = rec.userId || sessionUserId;
      const cleanNotes = sanitizeText(rec.notes);
      await client.execute({
        sql: `INSERT INTO attendance (id, student_id, user_id, date, status, halaqah_id, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(student_id, date) DO UPDATE SET
                status = excluded.status,
                user_id = excluded.user_id,
                halaqah_id = COALESCE(excluded.halaqah_id, attendance.halaqah_id),
                notes = excluded.notes`,
        args: [id, rec.studentId, userId, rec.date, rec.status, rec.halaqahId ?? null, cleanNotes ?? null],
      });
      savedCount++;
    }

    return NextResponse.json(
      { message: `Absensi berhasil disimpan (${savedCount} data tercatat)`, count: savedCount },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    return NextResponse.json({ error: "Gagal menyimpan absensi" }, { status: 500 });
  }
}