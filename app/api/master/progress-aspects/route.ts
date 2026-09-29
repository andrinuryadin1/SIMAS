import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody, generateId } from "@/lib/api-utils";

const AspectSchema = z.object({
  jenjang: z.string().min(1, "Jenjang wajib diisi"),
  level: z.string().optional().nullable(),
  category: z.string().min(1, "Kategori aspek wajib diisi"),
  aspectName: z.string().min(1, "Nama aspek wajib diisi"),
  description: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

export async function GET(request: NextRequest) {
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const jenjang = searchParams.get("jenjang");
  const level = searchParams.get("level");

  let query = "SELECT * FROM progress_aspects WHERE 1=1";
  const params: unknown[] = [];

  if (jenjang && jenjang !== "Semua") {
    query += " AND (jenjang = ? OR jenjang = 'Semua')";
    params.push(jenjang);
  }

  if (level && level !== "Semua") {
    query += " AND (level = ? OR level = 'Semua' OR level IS NULL)";
    params.push(level);
  }

  query += " ORDER BY order_index ASC, category ASC, aspect_name ASC";

  const aspects = db.prepare(query).all(...params);
  return NextResponse.json(aspects);
}

export async function POST(request: NextRequest) {
  // Hanya admin yang boleh menambah aspek perkembangan
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, AspectSchema);
  if (parseError) return parseError;

  try {
    const id = generateId("asp");
    db.prepare(`
      INSERT INTO progress_aspects (id, jenjang, level, category, aspect_name, description, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.jenjang,
      data.level || null,
      data.category,
      data.aspectName,
      data.description || null,
      data.orderIndex ?? 0
    );

    return NextResponse.json({ id, message: "Aspek perkembangan berhasil ditambahkan" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/master/progress-aspects error:", err);
    return NextResponse.json({ error: "Gagal membuat aspek perkembangan" }, { status: 500 });
  }
}
