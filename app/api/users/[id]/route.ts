import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getSessionOrError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

const UPDATABLE: Record<string, string> = {
  fullName: "full_name",
  full_name: "full_name",
  email: "email",
  phone: "phone",
  avatarUrl: "avatar_url",
  avatar_url: "avatar_url",
  status: "status",
  role: "role",
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { error: authError } = await getSessionOrError(["admin"]);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Partial update
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      const column = UPDATABLE[key];
      if (!column) continue;
      sets.push(`${column} = ?`);
      values.push(value === "" ? null : value);
    }

    if (body.password) {
      sets.push("password = ?");
      values.push(bcrypt.hashSync(body.password, 10));
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Tidak ada field yang diperbarui" }, { status: 400 });
    }

    sets.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ message: "Pengguna berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { session, error: authError } = await getSessionOrError(["admin"]);
    if (authError) return authError;

    const { id } = await params;

    const user = await db.prepare("SELECT full_name FROM users WHERE id = ?").get(id) as
      | { full_name: string }
      | undefined;
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Prevent self-deletion
    if ((session?.user as { id?: string } | undefined)?.id === id) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }

    await db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return NextResponse.json({ message: `Pengguna ${user.full_name} berhasil dihapus` });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}