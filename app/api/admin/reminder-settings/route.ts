import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getSessionOrError, parseBody } from "@/lib/api-utils";

interface ReminderRow {
  day_of_week: string;
  time: string;
  timezone: string;
  message: string | null;
  is_active: number;
}

const ReminderSchema = z.object({
  dayOfWeek: z.string().min(1, "Hari wajib dipilih"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm"),
  timezone: z.string().min(1, "Zona waktu wajib diisi"),
  message: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const { error } = await getSessionOrError(["admin", "manajemen"]);
  if (error) return error;

  const settings = await db
    .prepare(
      `SELECT day_of_week, time, timezone, message, is_active FROM reminder_settings ORDER BY updated_at DESC LIMIT 1`
    )
    .get() as ReminderRow | undefined;
  if (!settings) {
    return NextResponse.json({
      dayOfWeek: "thursday",
      time: "14:00",
      timezone: "Asia/Jakarta",
      message: "Assalamu'alaikum Ustadz/Ustadzah, mohon lengkapi input perkembangan santri pekan ini.",
      isActive: true,
    });
  }
  return NextResponse.json({
    dayOfWeek: settings.day_of_week,
    time: settings.time,
    timezone: settings.timezone,
    message: settings.message,
    isActive: Boolean(settings.is_active),
  });
}

export async function PUT(request: NextRequest) {
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, ReminderSchema);
  if (parseError) return parseError;

  try {
    // Upsert: delete old, insert new (single row table)
    await db.prepare("DELETE FROM reminder_settings").run();
    const id = `rem-${Date.now().toString(36)}`;
    await db.prepare(
      `INSERT INTO reminder_settings (id, day_of_week, time, timezone, message, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.dayOfWeek,
      data.time,
      data.timezone,
      data.message ?? null,
      data.isActive ? 1 : 0
    );

    return NextResponse.json({ message: "Pengaturan pengingat berhasil disimpan" });
  } catch (error) {
    console.error("PUT /api/admin/reminder-settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}