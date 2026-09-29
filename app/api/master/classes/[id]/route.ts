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
    const { name, capacity } = body;

    if (name !== undefined) {
      await db.prepare("UPDATE classes SET name = ? WHERE id = ?").run(name, id);
    }
    if (capacity !== undefined) {
      await db.prepare("UPDATE classes SET capacity = ? WHERE id = ?").run(capacity, id);
    }

    return NextResponse.json({ message: "Kelas berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/master/classes/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui kelas" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    // Check if any students are in this class
    const studentsInClass = await db
      .prepare("SELECT COUNT(*) AS c FROM students WHERE class_id = ?")
      .get(id) as { c: number };
    if (studentsInClass.c > 0) {
      return NextResponse.json(
        { error: `Tidak bisa menghapus: ${studentsInClass.c} santri masih berada di kelas ini` },
        { status: 409 }
      );
    }

    db.prepare("DELETE FROM classes WHERE id = ?").run(id);
    return NextResponse.json({ message: "Kelas berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/master/classes/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus kelas" }, { status: 500 });
  }
}