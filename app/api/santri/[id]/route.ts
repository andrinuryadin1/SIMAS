import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionOrError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

/** Columns a client is allowed to change, mapped to their DB column name. */
const UPDATABLE: Record<string, string> = {
  nis: "nis",
  full_name: "full_name",
  fullName: "full_name",
  gender: "gender",
  birth_date: "birth_date",
  birthDate: "birth_date",
  birth_place: "birth_place",
  birthPlace: "birth_place",
  address: "address",
  class_id: "class_id",
  classId: "class_id",
  class_name: "class_name",
  className: "class_name",
  halaqah_id: "halaqah_id",
  halaqahId: "halaqah_id",
  halaqah_name: "halaqah_name",
  halaqahName: "halaqah_name",
  academic_year_id: "academic_year_id",
  academicYearId: "academic_year_id",
  enrollment_date: "enrollment_date",
  enrollmentDate: "enrollment_date",
  father_name: "father_name",
  fatherName: "father_name",
  mother_name: "mother_name",
  motherName: "mother_name",
  guardian_name: "guardian_name",
  guardianName: "guardian_name",
  guardian_phone: "guardian_phone",
  guardianPhone: "guardian_phone",
  photo_url: "photo_url",
  photoUrl: "photo_url",
  status: "status",
  notes: "notes",
};

export async function GET(_request: NextRequest, { params }: Params) {
  // Hanya user yang login yang boleh melihat detail santri
  const { error } = await getSessionOrError();
  if (error) return error;

  const { id } = await params;

  const student = await db.prepare("SELECT * FROM students WHERE id = ?").get(id);
  if (!student) {
    return NextResponse.json({ error: "Santri tidak ditemukan" }, { status: 404 });
  }

  const attendance = await db.prepare("SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 20").all(id);
  const memorization = await db.prepare("SELECT * FROM memorization WHERE student_id = ? ORDER BY date DESC LIMIT 20").all(id);
  const behaviors = await db.prepare("SELECT * FROM behaviors WHERE student_id = ? ORDER BY date DESC LIMIT 20").all(id);

  const attendanceStats = {
    total: attendance.length,
    hadir: attendance.filter((a: any) => a.status === "hadir").length,
    terlambat: attendance.filter((a: any) => a.status === "terlambat").length,
    sakit: attendance.filter((a: any) => a.status === "sakit").length,
    izin: attendance.filter((a: any) => a.status === "izin").length,
    alpha: attendance.filter((a: any) => a.status === "alpha").length,
  };

  const totalMemorization = memorization.reduce((sum: number, m: any) => sum + (m.ayah_end - m.ayah_start + 1), 0);

  return NextResponse.json({
    student,
    attendance,
    memorization,
    behaviors,
    stats: {
      attendance: attendanceStats,
      totalMemorization,
      positiveBehavior: behaviors.filter((b: any) => b.type === "positif").length,
      negativeBehavior: behaviors.filter((b: any) => b.type === "pelanggaran").length,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { error: authError } = await getSessionOrError(["admin", "manajemen"]);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.prepare("SELECT id FROM students WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Santri tidak ditemukan" }, { status: 404 });
    }

    // Partial update: only touch the fields actually sent.
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      const column = UPDATABLE[key];
      if (!column) continue;
      sets.push(`${column} = ?`);
      values.push(value === "" ? null : value);
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Tidak ada field yang diperbarui" }, { status: 400 });
    }

    // Keep denormalised display columns consistent.
    if (body.class_name || body.className) {
      const classId = body.class_id ?? body.classId;
      if (classId) {
        const cls = await db.prepare("SELECT name FROM classes WHERE id = ?").get(classId) as { name: string } | undefined;
        if (cls) {
          sets.push("class_name = ?");
          values.push(cls.name);
        }
      }
    }
    if (body.halaqah_id !== undefined || body.halaqahId !== undefined) {
      const halaqahId = body.halaqah_id ?? body.halaqahId;
      if (halaqahId) {
        const h = await db.prepare("SELECT name FROM halaqahs WHERE id = ?").get(halaqahId) as { name: string } | undefined;
        if (h) {
          sets.push("halaqah_name = ?");
          values.push(h.name);
        }
      } else {
        sets.push("halaqah_name = ?");
        values.push(null);
      }
    }

    sets.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await db.prepare(`UPDATE students SET ${sets.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ message: "Data santri berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH /api/santri/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data santri" }, { status: 500 });
  }
}

/** Full replace — kept for backwards compatibility with the edit form. */
export async function PUT(request: NextRequest, { params }: Params) {
  const res = await PATCH(request, { params });
  return res;
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { error: authError } = await getSessionOrError(["admin"]);
    if (authError) return authError;

    const { id } = await params;

    const student = await db.prepare("SELECT full_name FROM students WHERE id = ?").get(id) as
      | { full_name: string }
      | undefined;
    if (!student) {
      return NextResponse.json({ error: "Santri tidak ditemukan" }, { status: 404 });
    }

    // Clear dependent rows first (FK constraints are enabled).
    const caseIds = (
      await db.prepare("SELECT id FROM special_cases WHERE student_id = ?").all(id)
    ).map((r: any) => r.id);
    for (const caseId of caseIds) {
      await db.prepare("DELETE FROM case_follow_ups WHERE case_id = ?").run(caseId);
    }
    await db.prepare("DELETE FROM special_cases WHERE student_id = ?").run(id);
    await db.prepare("DELETE FROM attendance WHERE student_id = ?").run(id);
    await db.prepare("DELETE FROM memorization WHERE student_id = ?").run(id);
    await db.prepare("DELETE FROM behaviors WHERE student_id = ?").run(id);
    await db.prepare("DELETE FROM adab_assessments WHERE student_id = ?").run(id);
    await db.prepare("DELETE FROM progress_records WHERE student_id = ?").run(id);
    await db.prepare("DELETE FROM students WHERE id = ?").run(id);

    return NextResponse.json({ message: `Santri ${student.full_name} berhasil dihapus` });
  } catch (error) {
    console.error("DELETE /api/santri/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus data santri" }, { status: 500 });
  }
}