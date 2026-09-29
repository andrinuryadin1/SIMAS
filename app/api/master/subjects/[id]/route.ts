import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (name !== undefined) {
      await db.prepare("UPDATE subjects SET name = ? WHERE id = ?").run(name, id);
    }
    if (description !== undefined) {
      await db.prepare("UPDATE subjects SET description = ? WHERE id = ?").run(description, id);
    }

    return NextResponse.json({ message: "Mata pelajaran berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/master/subjects/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui mata pelajaran" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    await db.prepare("DELETE FROM subjects WHERE id = ?").run(id);
    return NextResponse.json({ message: "Mata pelajaran berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/master/subjects/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus mata pelajaran" }, { status: 500 });
  }
}