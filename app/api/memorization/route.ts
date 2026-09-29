import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";
import { sanitizeText } from "@/lib/sanitize";

// ✅ Validasi Zod untuk POST setoran hafalan
const MemorizationSchema = z.object({
  studentId: z.string().min(1, "studentId wajib diisi"),
  userId: z.string().min(1, "userId wajib diisi"),
  type: z.enum(["ziyadah", "murojaah"]),
  surahName: z.string().min(1, "Nama surah wajib diisi").max(100),
  surahNumber: z.number().int().min(1).max(114).optional(),
  ayahStart: z.number().int().min(1, "Ayat awal wajib diisi"),
  ayahEnd: z.number().int().min(1, "Ayat akhir wajib diisi"),
  juz: z.number().int().min(1).max(30).optional(),
  quality: z.enum(["A", "B", "C", "D"]).optional(),
  note: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
}).refine((d) => d.ayahEnd >= d.ayahStart, {
  message: "Ayat akhir tidak boleh lebih kecil dari ayat awal",
  path: ["ayahEnd"],
});

export async function GET(request: NextRequest) {
  // ✅ Hanya user login yang boleh melihat data hafalan
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  let query =
    "SELECT m.*, s.full_name as student_name, s.nis FROM memorization m JOIN students s ON m.student_id = s.id";
  const params: unknown[] = [];

  if (studentId) {
    query += " WHERE m.student_id = ?";
    params.push(studentId);
  }
  query += " ORDER BY m.date DESC, m.created_at DESC";

  const memorization = await db.prepare(query).all(...params);
  return NextResponse.json(memorization);
}

export async function POST(request: NextRequest) {
  // ✅ Hanya guru dan admin yang boleh mencatat hafalan
  const { error: authError } = await getSessionOrError(["guru", "admin"]);
  if (authError) return authError;

  // ✅ Validasi payload dengan Zod
  const { data, error: parseError } = await parseBody(request, MemorizationSchema);
  if (parseError) return parseError;

  // ✅ Sanitasi note
  const cleanNote = sanitizeText(data.note);

  try {
    const id = generateId("mem");
    await db.prepare(`
      INSERT INTO memorization (id, student_id, user_id, type, surah_name, surah_number, ayah_start, ayah_end, juz, quality, note, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.studentId,
      data.userId,
      data.type,
      data.surahName,
      data.surahNumber ?? null,
      data.ayahStart,
      data.ayahEnd,
      data.juz ?? null,
      data.quality ?? null,
      cleanNote ?? null,
      data.date
    );

    return NextResponse.json({ id, message: "Setoran hafalan berhasil disimpan" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan setoran hafalan" }, { status: 500 });
  }
}