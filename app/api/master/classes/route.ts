import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody } from "@/lib/api-utils";

const ClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi").max(100),
  capacity: z.number().int().min(1).max(200).default(30),
});

export async function GET() {
  // Semua role yang login boleh melihat daftar kelas (untuk dropdown form)
  const { error } = await getSessionOrError();
  if (error) return error;

  const classes = await db
    .prepare(
      `SELECT c.*, COUNT(s.id) AS student_count
       FROM classes c
       LEFT JOIN students s ON s.class_id = c.id
       GROUP BY c.id
       ORDER BY c.name`
    )
    .all();
  return NextResponse.json(classes);
}

export async function POST(request: NextRequest) {
  // Hanya admin yang boleh tambah kelas
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, ClassSchema);
  if (parseError) return parseError;

  // Cek duplikat nama kelas
  const existing = await db.prepare("SELECT id FROM classes WHERE name = ?").get(data.name);
  if (existing) {
    return NextResponse.json({ error: `Kelas "${data.name}" sudah ada.` }, { status: 409 });
  }

  try {
    const id = `class-${Date.now().toString(36)}`;
    await db.prepare("INSERT INTO classes (id, name, capacity) VALUES (?, ?, ?)").run(
      id, data.name, data.capacity
    );
    return NextResponse.json({ id, message: "Kelas berhasil ditambahkan" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/master/classes error:", err);
    return NextResponse.json({ error: "Gagal membuat kelas" }, { status: 500 });
  }
}