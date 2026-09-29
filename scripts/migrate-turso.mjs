/**
 * migrate-turso.mjs
 * Push schema SiMas ke database Turso (libSQL).
 *
 * Cara pakai:
 *   node scripts/migrate-turso.mjs
 *
 * Env yang dibutuhkan (dari .env.local):
 *   TURSO_DATABASE_URL
 *   TURSO_AUTH_TOKEN
 */

import { readFileSync } from "fs";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env.local secara manual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", ".env.local");

try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.warn("⚠  Tidak bisa baca .env.local, menggunakan env dari sistem.");
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || url.startsWith("file:")) {
  console.error("❌ TURSO_DATABASE_URL tidak di-set atau masih memakai file lokal.");
  console.error("   Set TURSO_DATABASE_URL=libsql://... di .env.local");
  process.exit(1);
}

console.log(`🔗 Menghubungkan ke Turso: ${url}`);

const client = createClient({ url, authToken });

// Schema SQL (disalin dari lib/schema.ts agar tidak butuh TypeScript)
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','guru','manajemen')),
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('L','P')),
  birth_date TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  address TEXT,
  class_id TEXT,
  class_name TEXT NOT NULL,
  halaqah_id TEXT,
  halaqah_name TEXT,
  academic_year_id TEXT,
  enrollment_date TEXT,
  father_name TEXT,
  mother_name TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'aktif',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS halaqahs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pembina TEXT,
  jenjang_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('hadir','terlambat','sakit','izin','alpha')),
  halaqah_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS memorization (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('ziyadah','murojaah')),
  surah_name TEXT NOT NULL,
  surah_number INTEGER,
  ayah_start INTEGER NOT NULL,
  ayah_end INTEGER NOT NULL,
  juz INTEGER,
  quality TEXT CHECK(quality IN ('A','B','C','D')),
  note TEXT,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS adab_assessments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  score_honesty INTEGER,
  score_independence INTEGER,
  score_social INTEGER,
  score_cleanliness INTEGER,
  score_discipline INTEGER,
  average_score REAL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS behaviors (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('positif','pelanggaran')),
  category TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('ringan','sedang','berat')),
  description TEXT,
  action_taken TEXT,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS progress_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subject_category TEXT NOT NULL CHECK(subject_category IN ('berhitung','calistung')),
  aspect_name TEXT NOT NULL,
  period TEXT NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('belum','sedang_berkembang','berkembang','mahir')),
  score INTEGER,
  note TEXT,
  recorded_at TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS teaching_journals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  halaqah_id TEXT,
  subject TEXT,
  date TEXT NOT NULL,
  topic TEXT NOT NULL,
  method TEXT,
  summary TEXT,
  obstacles TEXT,
  reflection TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS special_cases (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('open','in_progress','resolved')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS case_follow_ups (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  by_user TEXT,
  at TEXT NOT NULL,
  note TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES special_cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link_url TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  semester TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_active INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS reminder_settings (
  id TEXT PRIMARY KEY,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  message TEXT,
  is_active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_aspects (
  id TEXT PRIMARY KEY,
  jenjang TEXT NOT NULL,
  level TEXT,
  category TEXT NOT NULL,
  aspect_name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_memorization_student ON memorization(student_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_student ON behaviors(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_aspects_jenjang ON progress_aspects(jenjang);
`;

async function migrate() {
  try {
    console.log("📋 Menjalankan migrasi schema...");
    await client.executeMultiple(SCHEMA_SQL);
    console.log("✅ Schema berhasil dibuat/diperbarui di Turso!");

    // Verifikasi tabel yang dibuat
    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const tables = result.rows.map((r) => r.name);
    console.log(`\n📊 Tabel yang ada di database (${tables.length} tabel):`);
    tables.forEach((t) => console.log(`   ✓ ${t}`));
  } catch (err) {
    console.error("❌ Gagal migrasi:", err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
