import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionOrError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { id } = await params;
  try {
    const body = await request.json();
    const { jenjang, level, kelas, category, aspectName, description, orderIndex } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (jenjang !== undefined) {
      updates.push("jenjang = ?");
      values.push(jenjang);
    }
    if (level !== undefined) {
      updates.push("level = ?");
      values.push(level || null);
    }
    if (kelas !== undefined) {
      updates.push("kelas = ?");
      values.push(kelas || null);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      values.push(category);
    }
    if (aspectName !== undefined) {
      updates.push("aspect_name = ?");
      values.push(aspectName);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description || null);
    }
    if (orderIndex !== undefined) {
      updates.push("order_index = ?");
      values.push(orderIndex);
    }

    if (updates.length > 0) {
      values.push(id);
      await db.prepare(`UPDATE progress_aspects SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    return NextResponse.json({ message: "Aspek perkembangan berhasil diperbarui" });
  } catch (err) {
    console.error("PATCH /api/master/progress-aspects/[id] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui aspek perkembangan" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { id } = await params;
  try {
    await db.prepare("DELETE FROM progress_aspects WHERE id = ?").run(id);
    return NextResponse.json({ message: "Aspek perkembangan berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/master/progress-aspects/[id] error:", err);
    return NextResponse.json({ error: "Gagal menghapus aspek perkembangan" }, { status: 500 });
  }
}
