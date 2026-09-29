import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getSessionOrError, parseBody } from "@/lib/api-utils";

const SELECT_USER = `
  SELECT
    u.id, u.email, u.full_name, u.role, u.phone, u.avatar_url, u.status,
    u.created_at, u.updated_at,
    (SELECT COUNT(*) FROM teaching_journals tj WHERE tj.user_id = u.id) AS journal_count,
    (SELECT COUNT(*) FROM students s WHERE s.halaqah_id IS NOT NULL) AS total_santri
  FROM users u
`;

function serializeUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    journalCount: row.journal_count ?? 0,
    totalSantri: row.total_santri ?? 0,
  };
}

// ✅ Validasi Zod untuk POST user baru
const CreateUserSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  fullName: z.string().min(2, "Nama minimal 2 karakter").max(100),
  role: z.enum(["admin", "guru", "manajemen"]),
  phone: z
    .string()
    .regex(/^(\+62|08)\d{8,13}$/, "Nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("URL avatar tidak valid").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET(request: NextRequest) {
  // ✅ Hanya admin yang boleh melihat daftar pengguna
  const { error } = await getSessionOrError(["admin"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = SELECT_USER;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (role && role !== "all") {
    conditions.push("u.role = ?");
    params.push(role);
  }
  if (status && status !== "all") {
    conditions.push("u.status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(u.full_name LIKE ? OR u.email LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY u.role, u.full_name";

  const users = await db.prepare(query).all(...params);
  return NextResponse.json(users.map(serializeUser));
}

export async function POST(request: NextRequest) {
  // ✅ Hanya admin yang boleh membuat pengguna baru
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  // ✅ Validasi payload dengan Zod
  const { data, error: parseError } = await parseBody(request, CreateUserSchema);
  if (parseError) return parseError;

  // ✅ Cek duplikat email
  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
  }

  try {
    const id = `${data.role}-${Date.now().toString(36)}`;
    await db.prepare(`
      INSERT INTO users (id, email, password, full_name, role, phone, avatar_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.email,
      bcrypt.hashSync(data.password, 10),
      data.fullName,
      data.role,
      data.phone || null,
      data.avatarUrl || null,
      data.status
    );

    return NextResponse.json({ id, message: "Pengguna berhasil ditambahkan" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
