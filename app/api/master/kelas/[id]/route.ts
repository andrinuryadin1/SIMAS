import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

const PatchKelasSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  capacity: z.number().int().min(1).max(200).optional(),
  jenjang_name: z.string().min(1).max(100).optional(),
  level_id: z.string().min(1).max(100).optional(),
  level_name: z.string().min(1).max(100).optional(),
  pembina: z.string().min(1).max(100).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { id } = await params;
  const { data, error: parseError } = await parseBody(request, PatchKelasSchema);
  if (parseError) return parseError;

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.capacity !== undefined) {
    updates.push("capacity = ?");
    values.push(data.capacity);
  }
  if (data.jenjang_name !== undefined) {
    updates.push("jenjang_name = ?");
    values.push(data.jenjang_name);
  }
  if (data.level_id !== undefined) {
    updates.push("level_id = ?");
    values.push(data.level_id);
  }
  if (data.level_name !== undefined) {
    updates.push("level_name = ?");
    values.push(data.level_name);
  }
  if (data.pembina !== undefined) {
    updates.push("pembina = ?");
    values.push(data.pembina);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Tidak ada field yang diperbarui" }, { status: 400 });
  }

  try {
    values.push(id);
    await db.prepare(`UPDATE kelas SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return NextResponse.json({ message: "Kelas berhasil diperbarui" });
  } catch (err) {
    console.error("PATCH /api/master/kelas/[id] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui kelas" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { id } = await params;

  const studentsInKelas = (await db
    .prepare("SELECT COUNT(*) AS c FROM students WHERE kelas_id = ?")
    .get(id)) as { c: number };
  if (studentsInKelas.c > 0) {
    return NextResponse.json(
      { error: `Tidak bisa menghapus: ${studentsInKelas.c} santri masih berada di kelas ini` },
      { status: 409 }
    );
  }

  try {
    await db.prepare("DELETE FROM kelas WHERE id = ?").run(id);
    return NextResponse.json({ message: "Kelas berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/master/kelas/[id] error:", err);
    return NextResponse.json({ error: "Gagal menghapus kelas" }, { status: 500 });
  }
}
