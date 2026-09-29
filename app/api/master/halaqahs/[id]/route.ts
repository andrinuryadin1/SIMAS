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
    const { name, pembina, jenjang_name } = body;

    if (name !== undefined) {
      await db.prepare("UPDATE halaqahs SET name = ? WHERE id = ?").run(name, id);
    }
    if (pembina !== undefined) {
      await db.prepare("UPDATE halaqahs SET pembina = ? WHERE id = ?").run(pembina, id);
    }
    if (jenjang_name !== undefined) {
      await db.prepare("UPDATE halaqahs SET jenjang_name = ? WHERE id = ?").run(jenjang_name, id);
    }

    return NextResponse.json({ message: "Level berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/master/halaqahs/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui level" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    const studentsInHalaqah = await db
      .prepare("SELECT COUNT(*) AS c FROM students WHERE halaqah_id = ?")
      .get(id) as { c: number };
    if (studentsInHalaqah.c > 0) {
      return NextResponse.json(
        { error: `Tidak bisa menghapus: ${studentsInHalaqah.c} santri masih berada di level ini` },
        { status: 409 }
      );
    }

    await db.prepare("DELETE FROM halaqahs WHERE id = ?").run(id);
    return NextResponse.json({ message: "Level berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/master/halaqahs/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus level" }, { status: 500 });
  }
}