import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const subjects = await db.prepare("SELECT * FROM subjects ORDER BY name").all();
  return NextResponse.json(subjects);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
    }

    const id = `mapel-${Date.now().toString(36)}`;
    await db.prepare("INSERT INTO subjects (id, name, description) VALUES (?, ?, ?)").run(id, name, description ?? "");

    return NextResponse.json({ id, message: "Mata pelajaran berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/master/subjects error:", error);
    return NextResponse.json({ error: "Gagal membuat mata pelajaran" }, { status: 500 });
  }
}