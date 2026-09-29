import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";

// ✅ Validasi Zod untuk POST santri baru
const CreateStudentSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi").max(20),
  full_name: z.string().min(2, "Nama lengkap wajib diisi").max(100),
  gender: z.enum(["L", "P"]),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
  birth_place: z.string().min(1, "Tempat lahir wajib diisi").max(100),
  address: z.string().max(500).optional(),
  class_id: z.string().optional(),
  class_name: z.string().min(1, "Nama kelas wajib diisi"),
  halaqah_id: z.string().optional(),
  academic_year_id: z.string().optional(),
  enrollment_date: z.string().optional(),
  father_name: z.string().max(100).optional(),
  mother_name: z.string().max(100).optional(),
  guardian_name: z.string().max(100).optional(),
  guardian_phone: z
    .string()
    .regex(/^(\+62|08)\d{8,13}$/, "Nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  photo_url: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  // ✅ Hanya user login yang boleh melihat daftar santri
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const halaqahId = searchParams.get("halaqahId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = "SELECT * FROM students WHERE 1=1";
  const params: unknown[] = [];

  if (classId) {
    query += " AND class_id = ?";
    params.push(classId);
  }
  if (halaqahId) {
    query += " AND halaqah_id = ?";
    params.push(halaqahId);
  }
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (search) {
    query += " AND (full_name LIKE ? OR nis LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY full_name";

  const students = await db.prepare(query).all(...params);
  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  // ✅ Hanya admin yang boleh menambah santri baru
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  // ✅ Validasi payload dengan Zod
  const { data, error: parseError } = await parseBody(request, CreateStudentSchema);
  if (parseError) return parseError;

  // ✅ Cek duplikat NIS
  const existing = await db
    .prepare("SELECT id FROM students WHERE nis = ?")
    .get(data.nis);
  if (existing) {
    return NextResponse.json({ error: `NIS ${data.nis} sudah terdaftar.` }, { status: 409 });
  }

  try {
    const id = generateId("student");
    await db.prepare(`
      INSERT INTO students (
        id, nis, full_name, gender, birth_date, birth_place, address,
        class_id, class_name, halaqah_id, academic_year_id, enrollment_date,
        father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)
    `).run(
      id, data.nis, data.full_name, data.gender, data.birth_date, data.birth_place,
      data.address ?? null, data.class_id ?? null, data.class_name,
      data.halaqah_id ?? null, data.academic_year_id ?? null, data.enrollment_date ?? null,
      data.father_name ?? null, data.mother_name ?? null, data.guardian_name ?? null,
      data.guardian_phone || null, data.photo_url || null, data.notes ?? null
    );

    return NextResponse.json({ id, message: "Santri berhasil ditambahkan" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambah santri" }, { status: 500 });
  }
}