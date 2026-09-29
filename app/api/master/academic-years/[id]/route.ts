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
    const { name, semester, startDate, endDate, isActive } = body;

    if (isActive) {
      // Only one academic year can be active at a time
      db.prepare("UPDATE academic_years SET is_active = 0 WHERE id != ?").run(id);
    }

    if (name !== undefined) {
      db.prepare("UPDATE academic_years SET name = ? WHERE id = ?").run(name, id);
    }
    if (semester !== undefined) {
      db.prepare("UPDATE academic_years SET semester = ? WHERE id = ?").run(semester, id);
    }
    if (startDate !== undefined) {
      db.prepare("UPDATE academic_years SET start_date = ? WHERE id = ?").run(startDate, id);
    }
    if (endDate !== undefined) {
      db.prepare("UPDATE academic_years SET end_date = ? WHERE id = ?").run(endDate, id);
    }
    if (isActive !== undefined) {
      db.prepare("UPDATE academic_years SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, id);
    }

    return NextResponse.json({ message: "Tahun ajaran berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/master/academic-years/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui tahun ajaran" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    db.prepare("DELETE FROM academic_years WHERE id = ?").run(id);
    return NextResponse.json({ message: "Tahun ajaran berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/master/academic-years/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus tahun ajaran" }, { status: 500 });
  }
}