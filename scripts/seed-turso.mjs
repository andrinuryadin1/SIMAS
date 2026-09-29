/**
 * seed-turso.mjs
 * Seed data awal ke database Turso untuk SiMas.
 *
 * Cara pakai:
 *   node scripts/seed-turso.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createHash } from "crypto";

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
  console.warn("⚠  Tidak bisa baca .env.local");
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || url.startsWith("file:")) {
  console.error("❌ TURSO_DATABASE_URL tidak di-set.");
  process.exit(1);
}

const client = createClient({ url, authToken });

// Simple bcrypt-compatible hash (menggunakan bcryptjs via dynamic import)
async function hashPassword(password) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.default.hashSync(password, 10);
}

async function exec(sql, args = []) {
  return client.execute({ sql, args });
}

async function seed() {
  console.log("🌱 Memulai seeding database Turso...\n");

  // Cek apakah sudah di-seed
  const existing = await exec("SELECT COUNT(*) as count FROM users");
  const count = Number(existing.rows[0].count);
  if (count > 0) {
    console.log(`ℹ  Database sudah berisi ${count} user. Seeding dilewati.`);
    console.log("   Gunakan flag --force untuk overwrite.\n");
    const args = process.argv.slice(2);
    if (!args.includes("--force")) {
      client.close();
      return;
    }
    console.log("   --force detected, melanjutkan...\n");
  }

  const hashedPassword = await hashPassword("password123");

  // ─── Classes ────────────────────────────────────────────────────────────────
  console.log("📚 Seeding classes...");
  const classes = [
    ["class-ka", "Kuttab Awal", 30],
    ["class-qo", "Qonuni", 30],
  ];
  for (const [id, name, capacity] of classes) {
    await exec("INSERT OR IGNORE INTO classes (id, name, capacity) VALUES (?, ?, ?)", [id, name, capacity]);
  }
  console.log(`   ✓ ${classes.length} classes`);

  // ─── Halaqahs ───────────────────────────────────────────────────────────────
  console.log("🕌 Seeding halaqahs...");
  const halaqahs = [
    ["level-ka-1", "Kuttab Awal 1", "Ustadz Rizki Firmansyah", "Kuttab Awal"],
    ["level-ka-2", "Kuttab Awal 2", "Ustadzah Sari Amelia", "Kuttab Awal"],
    ["level-ka-3", "Kuttab Awal 3", "Ustadz Hilmi Rahman", "Kuttab Awal"],
    ["level-qo-1", "Qonuni 1", "Ustadz Rizki Firmansyah", "Qonuni"],
    ["level-qo-2", "Qonuni 2", "Ustadzah Sari Amelia", "Qonuni"],
    ["level-qo-3", "Qonuni 3", "Ustadz Hilmi Rahman", "Qonuni"],
    ["level-qo-4", "Qonuni 4", null, "Qonuni"],
  ];
  for (const [id, name, pembina, jenjang] of halaqahs) {
    await exec(
      "INSERT OR IGNORE INTO halaqahs (id, name, pembina, jenjang_name) VALUES (?, ?, ?, ?)",
      [id, name, pembina, jenjang]
    );
  }
  console.log(`   ✓ ${halaqahs.length} halaqahs`);

  // ─── Academic Years ─────────────────────────────────────────────────────────
  console.log("📅 Seeding academic years...");
  await exec("INSERT OR IGNORE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)", ["ay-001", "2024/2025", "ganjil", 0]);
  await exec("INSERT OR IGNORE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)", ["ay-002", "2025/2026", "ganjil", 1]);
  console.log("   ✓ 2 academic years");

  // ─── Users ──────────────────────────────────────────────────────────────────
  console.log("👤 Seeding users...");
  const users = [
    ["admin-001", "admin@simas.sch.id", "Admin", "Sistem", "admin", "08111111111"],
    ["guru-001", "rizki@simas.sch.id", "Ustadz", "Rizki Firmansyah", "guru", "08222222222"],
    ["guru-002", "sari@simas.sch.id", "Ustadzah", "Sari Amelia", "guru", "08333333333"],
    ["guru-003", "hilmi@simas.sch.id", "Ustadz", "Hilmi Rahman", "guru", "08444444444"],
    ["manajemen-001", "kepala@simas.sch.id", "Kepala", "Sekolah", "manajemen", "08555555555"],
  ].map(([id, email, firstName, lastName, role, phone]) => ({
    id, email, fullName: `${firstName} ${lastName}`, role, phone,
  }));

  for (const u of users) {
    await exec(
      "INSERT OR IGNORE INTO users (id, email, password, full_name, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
      [u.id, u.email, hashedPassword, u.fullName, u.role, u.phone]
    );
  }
  console.log(`   ✓ ${users.length} users (password: password123)`);

  // ─── Students ───────────────────────────────────────────────────────────────
  console.log("🧒 Seeding students...");
  const students = [
    { id: "std-001", nis: "2024001", fullName: "Ahmad Fauzan Hakim", gender: "L", birthDate: "2016-03-15", birthPlace: "Jakarta", classId: "class-ka", className: "Kuttab Awal", halaqahId: "level-ka-1", fatherName: "Bapak Hakim", motherName: "Ibu Siti" },
    { id: "std-002", nis: "2024002", fullName: "Aisyah Nur Rahmah", gender: "P", birthDate: "2016-07-20", birthPlace: "Bandung", classId: "class-ka", className: "Kuttab Awal", halaqahId: "level-ka-1", fatherName: "Bapak Rahmad", motherName: "Ibu Nurul" },
    { id: "std-003", nis: "2024003", fullName: "Muhammad Ilyas Saputra", gender: "L", birthDate: "2015-11-05", birthPlace: "Bogor", classId: "class-ka", className: "Kuttab Awal", halaqahId: "level-ka-2", fatherName: "Bapak Saputra", motherName: "Ibu Dewi" },
    { id: "std-004", nis: "2024004", fullName: "Fatimah Azzahra", gender: "P", birthDate: "2015-05-18", birthPlace: "Depok", classId: "class-qo", className: "Qonuni", halaqahId: "level-qo-1", fatherName: "Bapak Zahra", motherName: "Ibu Maryam" },
    { id: "std-005", nis: "2024005", fullName: "Abdullah Yusuf", gender: "L", birthDate: "2014-09-30", birthPlace: "Bekasi", classId: "class-qo", className: "Qonuni", halaqahId: "level-qo-1", fatherName: "Bapak Yusuf", motherName: "Ibu Khadijah" },
    { id: "std-006", nis: "2024006", fullName: "Khadijah Salsabila", gender: "P", birthDate: "2014-12-10", birthPlace: "Tangerang", classId: "class-qo", className: "Qonuni", halaqahId: "level-qo-2", fatherName: "Bapak Sabil", motherName: "Ibu Zahra" },
  ];

  for (const s of students) {
    await exec(
      `INSERT OR IGNORE INTO students (
        id, nis, full_name, gender, birth_date, birth_place,
        class_id, class_name, halaqah_id, academic_year_id,
        father_name, mother_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')`,
      [s.id, s.nis, s.fullName, s.gender, s.birthDate, s.birthPlace,
       s.classId, s.className, s.halaqahId, "ay-002",
       s.fatherName, s.motherName]
    );
  }
  console.log(`   ✓ ${students.length} students`);

  // ─── Subjects ───────────────────────────────────────────────────────────────
  console.log("📖 Seeding subjects...");
  const subjects = [
    ["subject-001", "Tahfidz Qur'an"],
    ["subject-002", "Adab & Akhlak"],
    ["subject-003", "Berhitung"],
    ["subject-004", "Calistung"],
    ["subject-005", "Fiqih Ibadah"],
  ];
  for (const [id, name] of subjects) {
    await exec("INSERT OR IGNORE INTO subjects (id, name) VALUES (?, ?)", [id, name]);
  }
  console.log(`   ✓ ${subjects.length} subjects`);

  // ─── Reminder Settings ──────────────────────────────────────────────────────
  console.log("🔔 Seeding reminder settings...");
  await exec(
    "INSERT OR IGNORE INTO reminder_settings (id, day_of_week, time, timezone, message, is_active) VALUES (?, ?, ?, ?, ?, 1)",
    ["reminder-001", "thursday", "14:00", "Asia/Jakarta", "Mohon lengkapi input perkembangan santri pekan ini."]
  );
  console.log("   ✓ 1 reminder setting");

  console.log("\n✅ Database Turso berhasil di-seed!");
  console.log("\n📋 Akun default (semua password: password123):");
  console.log("   admin@simas.sch.id     → Admin");
  console.log("   rizki@simas.sch.id     → Guru");
  console.log("   kepala@simas.sch.id    → Manajemen");

  client.close();
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  client.close();
  process.exit(1);
});
