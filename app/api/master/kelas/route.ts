import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";

const KelasSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi").max(100),
  capacity: z.number().int().min(1).max(200).default(30),
  jenjang_name: z.string().min(1, "Jenjang wajib diisi").max(100),
  level_id: z.string().min(1, "Level induk wajib dipilih").max(100),
  level_name: z.string().min(1, "Level induk wajib dipilih").max(100),
  pembina: z.string().max(100).nullish(),
});

export async function GET() {
  // Semua role yang login boleh melihat daftar kelas (untuk dropdown form)
  const { error } = await getSessionOrError();
  if (error) return error;

  const kelas = await db
    .prepare(
      `SELECT k.*, COUNT(s.id) AS student_count
       FROM kelas k
       LEFT JOIN students s ON s.kelas_id = k.id
       GROUP BY k.id
       ORDER BY k.name`
    )
    .all();
  return NextResponse.json(kelas);
}

export async function POST(request: NextRequest) {
  // Hanya admin yang boleh menambah kelas
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, KelasSchema);
  if (parseError) return parseError;

  // Nama kelas harus unik di dalam level induknya
  const existing = await db
    .prepare("SELECT id FROM kelas WHERE name = ? AND level_id = ?")
    .get(data.name, data.level_id);
  if (existing) {
    return NextResponse.json(
      { error: `Kelas "${data.name}" sudah ada di level "${data.level_name}".` },
      { status: 409 }
    );
  }

  try {
    const id = generateId("kelas");
    await db
      .prepare(
        "INSERT INTO kelas (id, name, capacity, jenjang_name, level_id, level_name, pembina) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(id, data.name, data.capacity, data.jenjang_name, data.level_id, data.level_name, data.pembina ?? null);
    return NextResponse.json({ id, message: "Kelas berhasil ditambahkan" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/master/kelas error:", err);
    return NextResponse.json({ error: "Gagal membuat kelas" }, { status: 500 });
  }
}
