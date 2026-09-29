import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

async function getUser() {
  const session = await auth();
  if (!session?.user) return null;
  const id = (session.user as { id?: string }).id;
  if (!id) return null;
  return await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { password: _, ...safe } = user as any;
  return NextResponse.json(safe);
}

export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { fullName, phone, avatarUrl, oldPassword, newPassword, confirmPassword } = body as {
      fullName?: string;
      phone?: string;
      avatarUrl?: string;
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const sets: string[] = [];
    const values: unknown[] = [];

    if (fullName !== undefined) {
      sets.push("full_name = ?");
      values.push(fullName.trim() || null);
    }
    if (phone !== undefined) {
      sets.push("phone = ?");
      values.push(phone.trim() || null);
    }
    if (avatarUrl !== undefined) {
      sets.push("avatar_url = ?");
      values.push(avatarUrl.trim() || null);
    }

    if (oldPassword && newPassword && confirmPassword) {
      const ok = bcrypt.compareSync(oldPassword, (user as any).password);
      if (!ok) {
        return NextResponse.json({ error: "Password lama tidak cocok" }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "Konfirmasi password tidak cocok" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
      }
      sets.push("password = ?");
      values.push(bcrypt.hashSync(newPassword, 10));
    } else if (oldPassword || newPassword || confirmPassword) {
      return NextResponse.json({ error: "Password lama, baru, dan konfirmasi wajib diisi semua" }, { status: 400 });
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
    }

    sets.push("updated_at = CURRENT_TIMESTAMP");
    values.push((user as any).id);

    await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}