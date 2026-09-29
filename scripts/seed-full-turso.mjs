/**
 * seed-full-turso.mjs
 * Populate Turso database with full mock data for testing.
 */
import { readFileSync } from "fs";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log("🚀 Populating full mock data to Turso...\n");
  const hashedPassword = bcrypt.hashSync("password123", 10);

  // 1. Classes
  console.log("📚 Classes...");
  const classes = [
    ["class-ka", "Kuttab Awal", 30],
    ["class-qo", "Qonuni", 30],
  ];
  for (const [id, name, cap] of classes) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO classes (id, name, capacity) VALUES (?, ?, ?)",
      args: [id, name, cap],
    });
  }

  // 2. Halaqahs
  console.log("🕌 Halaqahs...");
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
    await client.execute({
      sql: "INSERT OR REPLACE INTO halaqahs (id, name, pembina, jenjang_name) VALUES (?, ?, ?, ?)",
      args: [id, name, pembina, jenjang],
    });
  }

  // 3. Academic Years
  console.log("📅 Academic Years...");
  await client.execute({
    sql: "INSERT OR REPLACE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)",
    args: ["ay-001", "2024/2025", "ganjil", 0],
  });
  await client.execute({
    sql: "INSERT OR REPLACE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)",
    args: ["ay-002", "2025/2026", "ganjil", 1],
  });

  // 4. Users
  console.log("👤 Users...");
  const users = [
    { id: "admin-001", email: "admin@simas.sch.id", name: "Admin Sistem", role: "admin", phone: "08111111111" },
    { id: "guru-001", email: "rizki@simas.sch.id", name: "Ustadz Rizki Firmansyah", role: "guru", phone: "08222222222" },
    { id: "guru-002", email: "sari@simas.sch.id", name: "Ustadzah Sari Amelia", role: "guru", phone: "08333333333" },
    { id: "guru-003", email: "hilmi@simas.sch.id", name: "Ustadz Hilmi Rahman", role: "guru", phone: "08444444444" },
    { id: "manajemen-001", email: "kepala@simas.sch.id", name: "Kepala Sekolah", role: "manajemen", phone: "08555555555" },
  ];
  for (const u of users) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO users (id, email, password, full_name, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
      args: [u.id, u.email, hashedPassword, u.name, u.role, u.phone],
    });
  }

  // 5. Students
  console.log("🧒 Students...");
  const students = [
    { id: "std-001", nis: "2024001", name: "Ahmad Fauzan Hakim", gender: "L", bdate: "2016-03-15", bplace: "Jakarta", cid: "class-ka", cname: "Kuttab Awal", hid: "level-ka-1", hname: "Kuttab Awal 1", father: "Bapak Hakim", mother: "Ibu Siti", phone: "08123456789" },
    { id: "std-002", nis: "2024002", name: "Aisyah Nur Rahmah", gender: "P", bdate: "2016-07-20", bplace: "Bandung", cid: "class-ka", cname: "Kuttab Awal", hid: "level-ka-1", hname: "Kuttab Awal 1", father: "Bapak Rahmad", mother: "Ibu Nurul", phone: "08123456790" },
    { id: "std-003", nis: "2024003", name: "Muhammad Ilyas Saputra", gender: "L", bdate: "2015-11-05", bplace: "Bogor", cid: "class-ka", cname: "Kuttab Awal", hid: "level-ka-2", hname: "Kuttab Awal 2", father: "Bapak Saputra", mother: "Ibu Dewi", phone: "08123456791" },
    { id: "std-004", nis: "2024004", name: "Fatimah Azzahra", gender: "P", bdate: "2015-05-18", bplace: "Depok", cid: "class-qo", cname: "Qonuni", hid: "level-qo-1", hname: "Qonuni 1", father: "Bapak Zahra", mother: "Ibu Maryam", phone: "08123456792" },
    { id: "std-005", nis: "2024005", name: "Abdullah Yusuf", gender: "L", bdate: "2014-09-30", bplace: "Bekasi", cid: "class-qo", cname: "Qonuni", hid: "level-qo-1", hname: "Qonuni 1", father: "Bapak Yusuf", mother: "Ibu Khadijah", phone: "08123456793" },
    { id: "std-006", nis: "2024006", name: "Khadijah Salsabila", gender: "P", bdate: "2014-12-10", bplace: "Tangerang", cid: "class-qo", cname: "Qonuni", hid: "level-qo-2", hname: "Qonuni 2", father: "Bapak Sabil", mother: "Ibu Zahra", phone: "08123456794" },
  ];
  for (const s of students) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO students (
        id, nis, full_name, gender, birth_date, birth_place,
        class_id, class_name, halaqah_id, halaqah_name, academic_year_id,
        father_name, mother_name, guardian_phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')`,
      args: [s.id, s.nis, s.name, s.gender, s.bdate, s.bplace, s.cid, s.cname, s.hid, s.hname, "ay-002", s.father, s.mother, s.phone],
    });
  }

  // 6. Subjects
  console.log("📖 Subjects...");
  const subjects = [
    ["subject-001", "Tahfidz Qur'an"],
    ["subject-002", "Adab & Akhlak"],
    ["subject-003", "Berhitung"],
    ["subject-004", "Calistung"],
    ["subject-005", "Fiqih Ibadah"],
  ];
  for (const [id, name] of subjects) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO subjects (id, name) VALUES (?, ?)",
      args: [id, name],
    });
  }

  // 7. Attendance
  console.log("📋 Attendance...");
  const attStatuses = ["hadir", "hadir", "hadir", "terlambat", "sakit", "izin"];
  let attCount = 0;
  const dates = ["2026-09-28", "2026-09-29", "2026-09-30"];
  for (const s of students) {
    for (let i = 0; i < dates.length; i++) {
      const st = attStatuses[(s.id.charCodeAt(6) + i) % attStatuses.length];
      attCount++;
      await client.execute({
        sql: "INSERT OR REPLACE INTO attendance (id, student_id, user_id, date, status, halaqah_id) VALUES (?, ?, ?, ?, ?, ?)",
        args: [`att-${attCount}`, s.id, "guru-001", dates[i], st, s.hid],
      });
    }
  }

  // 8. Memorization
  console.log("📖 Memorization...");
  const surahs = [
    { name: "An-Naba'", num: 78, juz: 30, start: 1, end: 10 },
    { name: "An-Nazi'at", num: 79, juz: 30, start: 1, end: 15 },
    { name: "'Abasa", num: 80, juz: 30, start: 1, end: 12 },
  ];
  let memCount = 0;
  for (const s of students) {
    for (let i = 0; i < surahs.length; i++) {
      const sur = surahs[i];
      memCount++;
      await client.execute({
        sql: `INSERT OR REPLACE INTO memorization (
          id, student_id, user_id, type, surah_name, surah_number,
          ayah_start, ayah_end, juz, quality, note, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `mem-${memCount}`, s.id, "guru-001",
          i % 2 === 0 ? "ziyadah" : "murojaah",
          sur.name, sur.num, sur.start, sur.end, sur.juz,
          "A", "Lancar dan makhraj baik", "2026-09-29",
        ],
      });
    }
  }

  // 9. Behaviors
  console.log("⭐ Behaviors...");
  let behCount = 0;
  for (const s of students) {
    behCount++;
    await client.execute({
      sql: `INSERT OR REPLACE INTO behaviors (
        id, student_id, user_id, type, category, severity, description, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `beh-${behCount}`, s.id, "guru-001", "positif",
        "Kedisiplinan", "ringan", "Membantu merapikan tempat shalat", "2026-09-29",
      ],
    });
  }

  // 10. Special Cases
  console.log("🚨 Special Cases...");
  await client.execute({
    sql: `INSERT OR REPLACE INTO special_cases (
      id, student_id, reporter_id, title, description, category, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "case-001", "std-001", "guru-001",
      "Kurang Konsentrasi Saat Halaqah",
      "Santri sering mengantuk pada jam halaqah pagi.",
      "akademik", "in_progress",
    ],
  });

  // 11. Follow ups
  await client.execute({
    sql: "INSERT OR REPLACE INTO case_follow_ups (id, case_id, by_user, at, note) VALUES (?, ?, ?, ?, ?)",
    args: ["cfu-001", "case-001", "Ustadz Rizki", "2026-09-29 10:00:00", "Sudah dikomunikasikan dengan orang tua."],
  });

  // 12. Notifications
  console.log("🔔 Notifications...");
  await client.execute({
    sql: "INSERT OR REPLACE INTO notifications (id, user_id, type, title, message, is_read) VALUES (?, ?, ?, ?, ?, 0)",
    args: ["notif-001", "admin-001", "system", "Sistem Diperbarui", "Versi baru SiMas aktif."],
  });
  await client.execute({
    sql: "INSERT OR REPLACE INTO notifications (id, user_id, type, title, message, is_read) VALUES (?, ?, ?, ?, ?, 0)",
    args: ["notif-002", "guru-001", "reminder", "Pengisian Jurnal", "Mohon isi jurnal mengajar hari ini."],
  });

  // 13. Reminder Settings
  console.log("⚙️ Reminder settings...");
  await client.execute({
    sql: "INSERT OR REPLACE INTO reminder_settings (id, day_of_week, time, timezone, message, is_active) VALUES (?, ?, ?, ?, ?, 1)",
    args: ["reminder-001", "thursday", "14:00", "Asia/Jakarta", "Mohon lengkapi input perkembangan santri pekan ini."],
  });

  console.log("\n✅ All mock data populated into Turso database!");
  client.close();
}

run().catch((e) => {
  console.error("❌ Failed:", e);
  client.close();
  process.exit(1);
});
