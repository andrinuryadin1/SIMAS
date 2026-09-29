import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";

// Cached stats computation (revalidates every 5 minutes)
const getCachedStats = unstable_cache(
  async (weekStart: string, monthStart: string, nowStr: string) => {
    // Total students
    const totalStudents = await db.prepare("SELECT COUNT(*) AS c FROM students WHERE status = 'aktif'").get<{ c: number }>();

    // Attendance this week
    const attendanceWeek = await db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) AS hadir
      FROM attendance
      WHERE date >= ?
    `).get<{ total: number; hadir: number }>(weekStart);

    const attendancePct = attendanceWeek && attendanceWeek.total > 0 ? Math.round((attendanceWeek.hadir / attendanceWeek.total) * 100) : 0;

    // Active cases
    const activeCases = await db.prepare(`
      SELECT COUNT(*) AS c FROM special_cases WHERE status IN ('open', 'in_progress')
    `).get<{ c: number }>();

    // Total users (guru)
    const totalGuru = await db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'guru' AND status = 'active'").get<{ c: number }>();

    // Hafalan this month
    const hafalanMonth = await db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN type = 'ziyadah' THEN 1 ELSE 0 END) AS ziyadah,
        SUM(CASE WHEN type = 'murojaah' THEN 1 ELSE 0 END) AS murojaah
      FROM memorization
      WHERE date >= ?
    `).get<{ total: number; ziyadah: number; murojaah: number }>(monthStart);

    // Behavior this month
    const behaviorsMonth = await db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN type = 'positif' THEN 1 ELSE 0 END) AS positif,
        SUM(CASE WHEN type = 'pelanggaran' THEN 1 ELSE 0 END) AS pelanggaran,
        SUM(CASE WHEN severity = 'berat' THEN 1 ELSE 0 END) AS berat
      FROM behaviors
      WHERE date >= ?
    `).get<{ total: number; positif: number; pelanggaran: number; berat: number }>(monthStart);

    // Students per class
    const studentsByClass = await db.prepare(`
      SELECT class_name AS label, COUNT(*) AS value
      FROM students
      WHERE status = 'aktif'
      GROUP BY class_name
      ORDER BY class_name
    `).all<{ label: string; value: number }>();

    // Attendance trend (last 7 days)
    const attendanceTrend = await db.prepare(`
      SELECT date AS label, COUNT(*) AS total, SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) AS hadir
      FROM attendance
      WHERE date >= ? AND date <= ?
      GROUP BY date
      ORDER BY date
    `).all<{ label: string; total: number; hadir: number }>(weekStart, nowStr);

    // Hafalan trend by class
    const hafalanByClass = await db.prepare(`
      SELECT s.class_name AS label, COUNT(*) AS value
      FROM memorization m
      JOIN students s ON m.student_id = s.id
      WHERE m.date >= ?
      GROUP BY s.class_name
      ORDER BY value DESC
    `).all<{ label: string; value: number }>(monthStart);

    // Behavior trend by type
    const behaviorTrend = await db.prepare(`
      SELECT type AS label, COUNT(*) AS value
      FROM behaviors
      WHERE date >= ?
      GROUP BY type
    `).all<{ label: string; value: number }>(monthStart);

    // Cases by status
    const casesByStatus = await db.prepare(`
      SELECT status AS label, COUNT(*) AS value
      FROM special_cases
      GROUP BY status
    `).all<{ label: string; value: number }>();

    return {
      overview: {
        totalStudents: totalStudents?.c ?? 0,
        attendancePct,
        activeCases: activeCases?.c ?? 0,
        totalGuru: totalGuru?.c ?? 0,
        hafalanThisMonth: hafalanMonth?.total ?? 0,
        behaviorsThisMonth: behaviorsMonth?.total ?? 0,
      },
      charts: {
        studentsByClass,
        attendanceTrend: attendanceTrend.map((d) => ({
          date: d.label,
          total: d.total,
          hadir: d.hadir,
          percentage: d.total > 0 ? Math.round((d.hadir / d.total) * 100) : 0,
        })),
        hafalanByClass,
        behaviorTrend,
        casesByStatus,
      },
      details: {
        hafalan: {
          total: hafalanMonth?.total ?? 0,
          ziyadah: hafalanMonth?.ziyadah ?? 0,
          murojaah: hafalanMonth?.murojaah ?? 0,
        },
        behaviors: {
          total: behaviorsMonth?.total ?? 0,
          positif: behaviorsMonth?.positif ?? 0,
          pelanggaran: behaviorsMonth?.pelanggaran ?? 0,
          berat: behaviorsMonth?.berat ?? 0,
        },
      },
    };
  },
  ["stats-overview"],
  { revalidate: 300 } // 5 minutes
);

// Guru-specific stats (not cached as it's user-specific)
async function getGuruStats(userId: string, weekStart: string, monthStart: string) {
  const myHalaqah = await db.prepare("SELECT halaqah_id FROM users WHERE id = ?").get<{ halaqah_id?: string }>(userId);
  if (!myHalaqah?.halaqah_id) return null;

  const myStudents = await db.prepare("SELECT COUNT(*) AS c FROM students WHERE halaqah_id = ? AND status = 'aktif'").get<{ c: number }>(myHalaqah.halaqah_id);
  const myAttendanceWeek = await db.prepare(`
    SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) AS hadir
    FROM attendance
    WHERE halaqah_id = ? AND date >= ?
  `).get<{ total: number; hadir: number }>(myHalaqah.halaqah_id, weekStart);
  const myAttendancePct = myAttendanceWeek && myAttendanceWeek.total > 0 ? Math.round((myAttendanceWeek.hadir / myAttendanceWeek.total) * 100) : 0;
  const myCases = await db.prepare(`
    SELECT COUNT(*) AS c FROM special_cases sc
    JOIN students s ON sc.student_id = s.id
    WHERE s.halaqah_id = ? AND sc.status IN ('open', 'in_progress')
  `).get<{ c: number }>(myHalaqah.halaqah_id);

  return {
    myStudents: myStudents?.c ?? 0,
    myAttendancePct,
    myActiveCases: myCases?.c ?? 0,
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as "admin" | "guru" | "manajemen";
  const userId = (session.user as any).id as string;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const weekStart = fmt(startOfWeek);
  const monthStart = fmt(startOfMonth);
  const nowStr = fmt(now);

  // Get cached global stats
  const stats = await getCachedStats(weekStart, monthStart, nowStr);

  // Get guru-specific stats if needed
  let guruStats = null;
  if (role === "guru") {
    guruStats = await getGuruStats(userId, weekStart, monthStart);
  }

  return NextResponse.json({
    ...stats,
    guruStats,
  });
}
