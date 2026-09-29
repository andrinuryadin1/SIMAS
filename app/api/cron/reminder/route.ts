import { NextRequest, NextResponse } from "next/server";
import { cronRateLimiter } from "@/lib/rate-limit";
import db from "@/lib/db";

interface ReminderSettings {
  day_of_week: string;
  time: string;
  timezone: string;
  message: string | null;
  is_active: number;
}

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function isReminderDay(settings: ReminderSettings): boolean {
  const today = new Date();
  const targetDay = DAY_MAP[settings.day_of_week.toLowerCase()];
  return today.getDay() === targetDay;
}

function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = start of week
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEndDate(date: Date): Date {
  const start = getWeekStartDate(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResult = await cronRateLimiter(ip);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter) } }
    );
  }

  try {
    // Get reminder settings
    const settings = await db
      .prepare(
        `SELECT day_of_week, time, timezone, message, is_active FROM reminder_settings ORDER BY updated_at DESC LIMIT 1`
      )
      .get() as ReminderSettings | undefined;

    if (!settings || !settings.is_active) {
      return NextResponse.json({ message: "Reminder not active or not configured" });
    }

    // Check if today is the reminder day
    if (!isReminderDay(settings)) {
      return NextResponse.json({ message: "Not a reminder day today" });
    }

    // Get all active gurus
    const gurus = await db
      .prepare(
        `SELECT id, full_name, email FROM users WHERE role = 'guru' AND status = 'active'`
      )
      .all() as Array<{ id: string; full_name: string; email: string }>;

    if (gurus.length === 0) {
      return NextResponse.json({ message: "No active gurus found" });
    }

    // Get week boundaries
    const weekStart = getWeekStartDate(new Date()).toISOString().split("T")[0];
    const weekEnd = getWeekEndDate(new Date()).toISOString().split("T")[0];

    // Check which gurus have incomplete weekly input
    const incompleteGurus: Array<{ id: string; full_name: string; missing: string[] }> = [];

    for (const guru of gurus) {
      const missing: string[] = [];

      // Check attendance input this week
      const attendanceCount = await db
        .prepare(
          `SELECT COUNT(*) as cnt FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ?`
        )
        .get(guru.id, weekStart, weekEnd) as { cnt: number } | undefined;
      if (!attendanceCount || attendanceCount.cnt === 0) missing.push("Absensi");

      // Check hafalan input this week
      const hafalanCount = await db
        .prepare(
          `SELECT COUNT(*) as cnt FROM quran_memorization WHERE teacher_id = ? AND date BETWEEN ? AND ?`
        )
        .get(guru.id, weekStart, weekEnd) as { cnt: number } | undefined;
      if (!hafalanCount || hafalanCount.cnt === 0) missing.push("Hafalan");

      // Check adab input this week
      const adabCount = await db
        .prepare(
          `SELECT COUNT(*) as cnt FROM adab_assessment WHERE teacher_id = ? AND date BETWEEN ? AND ?`
        )
        .get(guru.id, weekStart, weekEnd) as { cnt: number } | undefined;
      if (!adabCount || adabCount.cnt === 0) missing.push("Adab & Sikap");

      // Check perkembangan input this week
      const progressCount = await db
        .prepare(
          `SELECT COUNT(*) as cnt FROM progress_records WHERE teacher_id = ? AND recorded_at BETWEEN ? AND ?`
        )
        .get(guru.id, weekStart, weekEnd) as { cnt: number } | undefined;
      if (!progressCount || progressCount.cnt === 0) missing.push("Perkembangan Berhitung/Calistung");

      // Check jurnal input this week
      const jurnalCount = await db
        .prepare(
          `SELECT COUNT(*) as cnt FROM teaching_journals WHERE user_id = ? AND date BETWEEN ? AND ?`
        )
        .get(guru.id, weekStart, weekEnd) as { cnt: number } | undefined;
      if (!jurnalCount || jurnalCount.cnt === 0) missing.push("Jurnal Mengajar");

      if (missing.length > 0) {
        incompleteGurus.push({ id: guru.id, full_name: guru.full_name, missing });
      }
    }

    // Send notifications to incomplete gurus
    let notificationsSent = 0;
    for (const guru of incompleteGurus) {
      const title = "Reminder Mingguan: Input Belum Lengkap";
      const missingList = guru.missing.join(", ");
      const message = `${settings.message || "Assalamu'alaikum Ustadz/Ustadzah,"}\n\nAnda belum melengkapi input mingguan untuk: ${missingList}.\n\nMohon segera lengkapi sebelum akhir pekan.`;

      const notifId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      await db.prepare(
        `INSERT INTO notifications (id, user_id, type, title, message, link_url, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`
      ).run(notifId, guru.id, "reminder_weekly", title, message, "/guru/dashboard");

      notificationsSent++;
    }

    return NextResponse.json({
      message: `Reminder cron executed`,
      totalGurus: gurus.length,
      incompleteGurus: incompleteGurus.length,
      notificationsSent,
      weekStart,
      weekEnd,
    });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Allow manual trigger with cron secret
  return GET(request);
}