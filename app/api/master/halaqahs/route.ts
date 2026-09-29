import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const halaqahs = await db
    .prepare(
      `SELECT h.*, COUNT(s.id) AS student_count
       FROM halaqahs h
       LEFT JOIN students s ON s.halaqah_id = h.id
       GROUP BY h.id
       ORDER BY h.name`
    )
    .all();
  return NextResponse.json(halaqahs);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { name, pembina, jenjang_name } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama level wajib diisi" }, { status: 400 });
    }

    const id = `level-${Date.now().toString(36)}`;
    await db.prepare("INSERT INTO halaqahs (id, name, pembina, jenjang_name) VALUES (?, ?, ?, ?)").run(
      id,
      name,
      pembina ?? null,
      jenjang_name ?? null
    );

    return NextResponse.json({ id, message: "Level berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/master/halaqahs error:", error);
    return NextResponse.json({ error: "Gagal membuat level" }, { status: 500 });
  }
}