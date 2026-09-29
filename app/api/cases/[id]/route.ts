import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionOrError, generateId } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await getSessionOrError();
  if (error) return error;

  const { id } = await params;

  const specialCase = await db
    .prepare(
      `
      SELECT
        sc.*,
        s.full_name AS student_name, s.nis AS student_nis,
        s.class_name AS student_class, s.halaqah_name AS student_halaqah,
        s.photo_url AS student_photo, s.gender AS student_gender,
        s.guardian_name, s.guardian_phone,
        u.full_name AS reporter_name
      FROM special_cases sc
      JOIN students s ON sc.student_id = s.id
      JOIN users u ON sc.reporter_id = u.id
      WHERE sc.id = ?
    `
    )
    .get(id);

  if (!specialCase) {
    return NextResponse.json({ error: "Kasus tidak ditemukan" }, { status: 404 });
  }

  const followUps = await db
    .prepare("SELECT * FROM case_follow_ups WHERE case_id = ? ORDER BY at DESC, rowid DESC")
    .all(id);

  return NextResponse.json({
    id: specialCase.id,
    studentId: specialCase.student_id,
    student: {
      fullName: specialCase.student_name,
      nis: specialCase.student_nis,
      className: specialCase.student_class,
      halaqahName: specialCase.student_halaqah,
      photoUrl: specialCase.student_photo,
      gender: specialCase.student_gender,
      guardianName: specialCase.guardian_name,
      guardianPhone: specialCase.guardian_phone,
    },
    reporterId: specialCase.reporter_id,
    reporterName: specialCase.reporter_name,
    title: specialCase.title,
    description: specialCase.description,
    category: specialCase.category,
    status: specialCase.status,
    createdAt: specialCase.created_at,
    updatedAt: specialCase.updated_at,
    followUpNotes: followUps.map((f) => ({
      id: f.id,
      by: f.by_user,
      at: f.at,
      note: f.note,
    })),
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { session, error: authError } = await getSessionOrError(["admin", "manajemen", "guru"]);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const { status, note } = body as { status?: string; note?: string };

    if (status) {
      if (!["open", "in_progress", "resolved"].includes(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }
      await db.prepare("UPDATE special_cases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        status,
        id
      );
    }

    if (note) {
      const noteId = generateId("cf");
      const userName = (session?.user as any)?.name ?? "Pengguna";
      await db.prepare("INSERT INTO case_follow_ups (id, case_id, by_user, at, note) VALUES (?, ?, ?, ?, ?)").run(
        noteId,
        id,
        userName,
        new Date().toISOString().split("T")[0],
        note
      );
    }

    return NextResponse.json({ message: "Kasus berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/cases/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui kasus" }, { status: 500 });
  }
}
