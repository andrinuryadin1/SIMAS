import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const years = db
    .prepare("SELECT * FROM academic_years ORDER BY is_active DESC, name DESC")
    .all();
  return NextResponse.json(years);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { name, semester, startDate, endDate } = body;

    if (!name || !semester) {
      return NextResponse.json({ error: "Nama tahun ajaran dan semester wajib diisi" }, { status: 400 });
    }

    const id = `ta-${Date.now().toString(36)}`;
    db.prepare(
      "INSERT INTO academic_years (id, name, semester, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, 0)"
    ).run(id, name, semester, startDate ?? null, endDate ?? null);

    return NextResponse.json({ id, message: "Tahun ajaran berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/master/academic-years error:", error);
    return NextResponse.json({ error: "Gagal membuat tahun ajaran" }, { status: 500 });
  }
}