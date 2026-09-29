import "server-only";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

/**
 * Tabel yang menyimpan data dummy/operasional.
 * Sengaja TIDAK memuat tabel referensi (users, classes, halaqahs,
 * academic_years, subjects, progress_aspects) supaya struktur tetap utuh.
 */
export const OPERATIONAL_TABLES = [
  "attendance",
  "memorization",
  "adab_assessments",
  "behaviors",
  "progress_records",
  "teaching_journals",
  "special_cases",
  "case_follow_ups",
  "notifications",
  "students",
] as const;

export interface ResetSummary {
  table: string;
  deleted: number;
}

/** Pastikan tabel referensi terisi (idempotent). */
export async function ensureReferenceData(): Promise<void> {
  await db.exec("PRAGMA foreign_keys = OFF");
  try {
    const insertClass = db.prepare(
      "INSERT OR IGNORE INTO classes (id, name, capacity) VALUES (?, ?, ?)"
    );
    for (const c of DEFAULT_CLASSES) await insertClass.run(c.id, c.name, c.capacity);

    const insertHalaqah = db.prepare(
      "INSERT OR IGNORE INTO halaqahs (id, name, pembina) VALUES (?, ?, ?)"
    );
    for (const h of DEFAULT_HALAQHS) await insertHalaqah.run(h.id, h.name, h.pembina);

    const insertYear = db.prepare(
      "INSERT OR IGNORE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)"
    );
    for (const y of DEFAULT_ACADEMIC_YEARS)
      await insertYear.run(y.id, y.name, "ganjil", y.isActive);

    const insertSubject = db.prepare("INSERT OR IGNORE INTO subjects (id, name) VALUES (?, ?)");
    DEFAULT_SUBJECTS.forEach((name, i) =>
      insertSubject.run(`subject-${String(i + 1).padStart(3, "0")}`, name)
    );
  } finally {
    await db.exec("PRAGMA foreign_keys = ON");
  }
}

/** Hapus seluruh data operasional, pertahankan user + data referensi. */
export async function resetOperationalData(): Promise<ResetSummary[]> {
  await db.exec("PRAGMA foreign_keys = OFF");
  const summary: ResetSummary[] = [];
  try {
    for (const table of OPERATIONAL_TABLES) {
      const info = await db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
        .get(table);
      if (!info) continue;
      const result = await db.prepare(`DELETE FROM ${table}`).run();
      summary.push({ table, deleted: result.changes });
    }
  } finally {
    await db.exec("PRAGMA foreign_keys = ON");
  }
  return summary;
}

/**
 * Hapus data operasional lalu pastikan user login + referensi tersedia kembali.
 * Dipakai oleh tombol "Reset & Seed Ulang".
 */
export async function resetAndReseed(): Promise<{ summary: ResetSummary[]; users: number }> {
  const summary = await resetOperationalData();

  await db.exec("PRAGMA foreign_keys = OFF");
  try {
    await db.prepare("DELETE FROM users").run();
  } finally {
    await db.exec("PRAGMA foreign_keys = ON");
  }

  await ensureReferenceData();

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const insertUser = db.prepare(
    `INSERT OR REPLACE INTO users (id, email, password, full_name, role, phone, avatar_url, status)
     VALUES (?, ?, ?, ?, ?, ?, NULL, 'active')`
  );
  for (const u of DEFAULT_USERS) {
    await insertUser.run(u.id, u.email, hash, u.full_name, u.role, u.phone);
  }

  return { summary, users: DEFAULT_USERS.length };
}

// ---- data referensi (dipakai oleh ensureReferenceData / resetAndReseed) ----

const DEFAULT_CLASSES = [
  { id: "class-ka", name: "Kuttab Awal", capacity: 30 },
  { id: "class-qo", name: "Qonuni", capacity: 30 },
];

const DEFAULT_HALAQHS = [
  { id: "level-ka-1", name: "Kuttab Awal 1", pembina: "Ustadz Rizki Firmansyah" },
  { id: "level-ka-2", name: "Kuttab Awal 2", pembina: "Ustadzah Sari Amelia" },
  { id: "level-ka-3", name: "Kuttab Awal 3", pembina: "Ustadz Hilmi Rahman" },
  { id: "level-qo-1", name: "Qonuni 1", pembina: "Ustadz Rizki Firmansyah" },
  { id: "level-qo-2", name: "Qonuni 2", pembina: "Ustadzah Sari Amelia" },
  { id: "level-qo-3", name: "Qonuni 3", pembina: "Ustadz Hilmi Rahman" },
  { id: "level-qo-4", name: "Qonuni 4", pembina: null },
];

const DEFAULT_ACADEMIC_YEARS = [
  { id: "ay-001", name: "2024/2025", isActive: 0 },
  { id: "ay-002", name: "2025/2026", isActive: 1 },
];

const DEFAULT_SUBJECTS = [
  "Tahfidz Qur'an",
  "Adab & Akhlak",
  "Berhitung",
  "Calistung",
  "Fiqih Ibadah",
];

const DEFAULT_USERS = [
  {
    id: "admin-001",
    email: "admin@kuttabal-fatih.sch.id",
    full_name: "Admin SiMas",
    role: "admin",
    phone: null,
  },
  {
    id: "guru-001",
    email: "rizki.firmansyah@kuttabal-fatih.sch.id",
    full_name: "Ustadz Rizki Firmansyah",
    role: "guru",
    phone: "08123456789",
  },
  {
    id: "manajemen-001",
    email: "hendra.wijaya@kuttabal-fatih.sch.id",
    full_name: "Ustadz Hendra Wijaya",
    role: "manajemen",
    phone: "08123456780",
  },
];

export const DEFAULT_PASSWORD = "password123";
