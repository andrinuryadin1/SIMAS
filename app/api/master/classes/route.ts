import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";

const ClassSchema = z.object({
  name: z.string().min(1, "Nama jenjang wajib diisi").max(100),
  capacity: z.number().int().min(1).max(200).default(30),
});

export async function GET() {
  // Semua role yang login boleh melihat daftar jenjang (untuk dropdown form)
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
  // Hanya admin yang boleh menambah jenjang
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, ClassSchema);
  if (parseError) return parseError;

  // Cek duplikat nama jenjang
  const existing = await db.prepare("SELECT id FROM classes WHERE name = ?").get(data.name);
  if (existing) {
    return NextResponse.json({ error: `Jenjang "${data.name}" sudah ada.` }, { status: 409 });
  }

  try {
    const id = generateId("class");
    await db.prepare("INSERT INTO classes (id, name, capacity) VALUES (?, ?, ?)").run(
      id, data.name, data.capacity
    );
    return NextResponse.json({ id, message: "Jenjang berhasil ditambahkan" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/master/classes error:", err);
    return NextResponse.json({ error: "Gagal membuat jenjang" }, { status: 500 });
  }
}
