import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { mockStudents } from "@/lib/mock/students";
import { mockUsers } from "@/lib/mock/users";
import { mockAttendance } from "@/lib/mock/attendance";
import { mockQuranMemorization } from "@/lib/mock/memorization";
import { mockBehaviors } from "@/lib/mock/behaviors";
import { mockSpecialCases } from "@/lib/mock/cases";
import { mockNotifications } from "@/lib/mock/notifications";

export async function seedDatabase() {
  // Helper: SQLite can only bind primitives, so normalise Date -> "YYYY-MM-DD".
  const toDateString = (d: unknown): string => {
    if (!d) return new Date().toISOString().split("T")[0];
    if (d instanceof Date) return d.toISOString().split("T")[0];
    return String(d);
  };

  const existing = await db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (existing.count > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  // Seed Jenjang (classes)
  const insertClass = db.prepare("INSERT OR IGNORE INTO classes (id, name, capacity) VALUES (?, ?, ?)");
  await insertClass.run("class-ka", "Kuttab Awal", 30);
  await insertClass.run("class-qo", "Qonuni", 30);

  // Seed Level (halaqahs)
  const insertHalaqah = db.prepare("INSERT OR IGNORE INTO halaqahs (id, name, pembina, jenjang_name) VALUES (?, ?, ?, ?)");
  await insertHalaqah.run("level-ka-1", "Kuttab Awal 1", "Ustadz Rizki Firmansyah", "Kuttab Awal");
  await insertHalaqah.run("level-ka-2", "Kuttab Awal 2", "Ustadzah Sari Amelia", "Kuttab Awal");
  await insertHalaqah.run("level-ka-3", "Kuttab Awal 3", "Ustadz Hilmi Rahman", "Kuttab Awal");
  await insertHalaqah.run("level-qo-1", "Qonuni 1", "Ustadz Rizki Firmansyah", "Qonuni");
  await insertHalaqah.run("level-qo-2", "Qonuni 2", "Ustadzah Sari Amelia", "Qonuni");
  await insertHalaqah.run("level-qo-3", "Qonuni 3", "Ustadz Hilmi Rahman", "Qonuni");
  await insertHalaqah.run("level-qo-4", "Qonuni 4", null, "Qonuni");

  // Seed academic years
  const insertAY = db.prepare("INSERT OR IGNORE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)");
  await insertAY.run("ay-001", "2024/2025", "ganjil", 0);
  await insertAY.run("ay-002", "2025/2026", "ganjil", 1);

  // Seed users
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, full_name, role, phone, avatar_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);
  const hashedPassword = bcrypt.hashSync("password123", 10);
  for (const user of mockUsers) {
    await insertUser.run(
      user.id,
      user.email,
      hashedPassword,
      user.fullName,
      user.role,
      user.phone || null,
      user.avatarUrl || null
    );
  }
  console.log(`  ✓ ${mockUsers.length} users`);

  // Seed Kelas (kelas nyata di bawah setiap Level).
  //
  // WAJIB dieksekusi SESUDAH users: kolom `pembina_id` memakai FK ke
  // users(id). Dulu tabel ini di-seed sebelum users sehingga relasi ke guru
  // hanya bisa disimpan sebagai teks (`pembina`),/statistik guru jadi rapuh.
  const insertKelas = db.prepare(
    "INSERT OR IGNORE INTO kelas (id, name, level_id, level_name, jenjang_name, capacity, pembina, pembina_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const KELAS_SEED: Array<[string, string, string, string, string, number, string | null, string | null]> = [
    // Kuttab Awal — pembina mengikuti level masing-masing
    ["kelas-ka-1-a", "Kuttab Awal 1-A", "level-ka-1", "Kuttab Awal 1", "Kuttab Awal", 25, "Ustadz Rizki Firmansyah", "guru-001"],
    ["kelas-ka-1-b", "Kuttab Awal 1-B", "level-ka-1", "Kuttab Awal 1", "Kuttab Awal", 25, "Ustadz Rizki Firmansyah", "guru-001"],
    ["kelas-ka-2-a", "Kuttab Awal 2-A", "level-ka-2", "Kuttab Awal 2", "Kuttab Awal", 25, "Ustadzah Sari Amelia", "guru-002"],
    ["kelas-ka-2-b", "Kuttab Awal 2-B", "level-ka-2", "Kuttab Awal 2", "Kuttab Awal", 25, "Ustadzah Sari Amelia", "guru-002"],
    ["kelas-ka-3-a", "Kuttab Awal 3-A", "level-ka-3", "Kuttab Awal 3", "Kuttab Awal", 25, "Ustadz Hilmi Rahman", "guru-003"],
    // Qonuni — pembina mengikuti level masing-masing
    ["kelas-qo-1-a", "Qonuni 1-A", "level-qo-1", "Qonuni 1", "Qonuni", 25, "Ustadz Rizki Firmansyah", "guru-001"],
    ["kelas-qo-1-b", "Qonuni 1-B", "level-qo-1", "Qonuni 1", "Qonuni", 25, "Ustadz Rizki Firmansyah", "guru-001"],
    ["kelas-qo-2-a", "Qonuni 2-A", "level-qo-2", "Qonuni 2", "Qonuni", 25, "Ustadzah Sari Amelia", "guru-002"],
    ["kelas-qo-2-b", "Qonuni 2-B", "level-qo-2", "Qonuni 2", "Qonuni", 25, "Ustadzah Sari Amelia", "guru-002"],
    ["kelas-qo-3-a", "Qonuni 3-A", "level-qo-3", "Qonuni 3", "Qonuni", 25, "Ustadz Hilmi Rahman", "guru-003"],
    ["kelas-qo-4-a", "Qonuni 4-A", "level-qo-4", "Qonuni 4", "Qonuni", 25, null, null],
  ];
  for (const row of KELAS_SEED) {
    await insertKelas.run(...row);
  }

  // Seed students
  const insertStudent = db.prepare(`
    INSERT OR IGNORE INTO students (
      id, nis, full_name, gender, birth_date, birth_place, address,
      class_id, class_name, halaqah_id, academic_year_id, enrollment_date,
      father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes,
      kelas_id, kelas_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of mockStudents) {
    await insertStudent.run(
      s.id, s.nis, s.fullName, s.gender, s.birthDate, s.birthPlace, s.address,
      s.classId, s.className, s.halaqahId, s.academicYearId, s.enrollmentDate,
      s.fatherName, s.motherName, s.guardianName, s.guardianPhone, s.photoUrl, s.status, s.notes,
      s.kelasId ?? null, s.kelasName ?? null
    );
  }
  console.log(`  ✓ ${mockStudents.length} students`);

  // Get a guru user ID for foreign keys
  const guruUser = await db.prepare("SELECT id FROM users WHERE role = 'guru' LIMIT 1").get() as { id: string } | undefined;
  const defaultGuruId = guruUser?.id || "guru-001";

  // Seed attendance
  const insertAttendance = db.prepare(`
    INSERT OR IGNORE INTO attendance (id, student_id, user_id, date, status, halaqah_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const a of mockAttendance) {
    await await insertAttendance.run(
      a.id, a.studentId, defaultGuruId, toDateString(a.date),
      a.status, a.halaqahId
    );
  }
  console.log(`  ✓ ${mockAttendance.length} attendance records`);

  // Seed memorization
  const insertMem = db.prepare(`
    INSERT OR IGNORE INTO memorization (id, student_id, user_id, type, surah_name, surah_number, ayah_start, ayah_end, juz, quality, note, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of mockQuranMemorization) {
    await insertMem.run(
      m.id, m.studentId, defaultGuruId, m.type, m.surahName, m.surahNumber,
      m.ayahStart, m.ayahEnd, m.juz, m.quality, m.note, toDateString(m.date)
    );
  }
  console.log(`  ✓ ${mockQuranMemorization.length} memorization records`);

  // Seed behaviors
  const insertBehavior = db.prepare(`
    INSERT OR IGNORE INTO behaviors (id, student_id, user_id, type, category, severity, description, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const b of mockBehaviors) {
    await insertBehavior.run(
      b.id,
      b.studentId,
      defaultGuruId,
      b.type,
      b.category,
      b.severity || null,
      b.description || null,
      toDateString(b.date)
    );
  }
  console.log(`  ✓ ${mockBehaviors.length} behavior records`);

  // Seed special cases
  const insertCase = db.prepare(`
    INSERT OR IGNORE INTO special_cases (id, student_id, reporter_id, title, description, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of mockSpecialCases) {
    await insertCase.run(
      c.id, c.studentId, defaultGuruId, c.title, c.description, c.category, c.status
    );
  }
  console.log(`  ✓ ${mockSpecialCases.length} special cases`);

  // Seed notifications
  const insertNotif = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, user_id, type, title, message, link_url, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const n of mockNotifications) {
    await insertNotif.run(n.id, n.userId, n.type, n.title, n.message, n.linkUrl, n.isRead ? 1 : 0);
  }
  console.log(`  ✓ ${mockNotifications.length} notifications`);

  // Seed reminder settings
  await db.prepare(`
    INSERT OR IGNORE INTO reminder_settings (id, day_of_week, time, timezone, message, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run("reminder-001", "thursday", "14:00", "Asia/Jakarta", "Mohon lengkapi input perkembangan santri pekan ini.");

  // Seed subjects
  const insertSubject = db.prepare("INSERT OR IGNORE INTO subjects (id, name) VALUES (?, ?)");
  await insertSubject.run("subject-001", "Tahfidz Qur'an");
  await insertSubject.run("subject-002", "Adab & Akhlak");
  await insertSubject.run("subject-003", "Berhitung");
  await insertSubject.run("subject-004", "Calistung");
  await insertSubject.run("subject-005", "Fiqih Ibadah");

  console.log("Database seeded successfully!");
}