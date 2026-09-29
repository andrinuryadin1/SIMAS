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
  insertClass.run("class-ka", "Kuttab Awal", 30);
  insertClass.run("class-qo", "Qonuni", 30);

  // Seed Level (halaqahs)
  const insertHalaqah = db.prepare("INSERT OR IGNORE INTO halaqahs (id, name, pembina, jenjang_name) VALUES (?, ?, ?, ?)");
  insertHalaqah.run("level-ka-1", "Kuttab Awal 1", "Ustadz Rizki Firmansyah", "Kuttab Awal");
  insertHalaqah.run("level-ka-2", "Kuttab Awal 2", "Ustadzah Sari Amelia", "Kuttab Awal");
  insertHalaqah.run("level-ka-3", "Kuttab Awal 3", "Ustadz Hilmi Rahman", "Kuttab Awal");
  insertHalaqah.run("level-qo-1", "Qonuni 1", "Ustadz Rizki Firmansyah", "Qonuni");
  insertHalaqah.run("level-qo-2", "Qonuni 2", "Ustadzah Sari Amelia", "Qonuni");
  insertHalaqah.run("level-qo-3", "Qonuni 3", "Ustadz Hilmi Rahman", "Qonuni");
  insertHalaqah.run("level-qo-4", "Qonuni 4", null, "Qonuni");

  // Seed academic years
  const insertAY = db.prepare("INSERT OR IGNORE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)");
  insertAY.run("ay-001", "2024/2025", "ganjil", 0);
  insertAY.run("ay-002", "2025/2026", "ganjil", 1);

  // Seed users
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, full_name, role, phone, avatar_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);
  const hashedPassword = bcrypt.hashSync("password123", 10);
  mockUsers.forEach((user) => {
    insertUser.run(
      user.id,
      user.email,
      hashedPassword,
      user.fullName,
      user.role,
      user.phone || null,
      user.avatarUrl || null
    );
  });
  console.log(`  ✓ ${mockUsers.length} users`);

  // Seed students
  const insertStudent = db.prepare(`
    INSERT OR IGNORE INTO students (
      id, nis, full_name, gender, birth_date, birth_place, address,
      class_id, class_name, halaqah_id, academic_year_id, enrollment_date,
      father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  mockStudents.forEach((s) => {
    insertStudent.run(
      s.id, s.nis, s.fullName, s.gender, s.birthDate, s.birthPlace, s.address,
      s.classId, s.className, s.halaqahId, s.academicYearId, s.enrollmentDate,
      s.fatherName, s.motherName, s.guardianName, s.guardianPhone, s.photoUrl, s.status, s.notes
    );
  });
  console.log(`  ✓ ${mockStudents.length} students`);

  // Get a guru user ID for foreign keys
  const guruUser = await db.prepare("SELECT id FROM users WHERE role = 'guru' LIMIT 1").get() as { id: string } | undefined;
  const defaultGuruId = guruUser?.id || "guru-001";

  // Seed attendance
  const insertAttendance = db.prepare(`
    INSERT OR IGNORE INTO attendance (id, student_id, user_id, date, status, halaqah_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  mockAttendance.forEach((a) => {
    insertAttendance.run(
      a.id, a.studentId, defaultGuruId, toDateString(a.date),
      a.status, a.halaqahId
    );
  });
  console.log(`  ✓ ${mockAttendance.length} attendance records`);

  // Seed memorization
  const insertMem = db.prepare(`
    INSERT OR IGNORE INTO memorization (id, student_id, user_id, type, surah_name, surah_number, ayah_start, ayah_end, juz, quality, note, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  mockQuranMemorization.forEach((m) => {
    insertMem.run(
      m.id, m.studentId, defaultGuruId, m.type, m.surahName, m.surahNumber,
      m.ayahStart, m.ayahEnd, m.juz, m.quality, m.note, toDateString(m.date)
    );
  });
  console.log(`  ✓ ${mockQuranMemorization.length} memorization records`);

  // Seed behaviors
  const insertBehavior = db.prepare(`
    INSERT OR IGNORE INTO behaviors (id, student_id, user_id, type, category, severity, description, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  mockBehaviors.forEach((b) => {
    insertBehavior.run(
      b.id,
      b.studentId,
      defaultGuruId,
      b.type,
      b.category,
      b.severity || null,
      b.description || null,
      toDateString(b.date)
    );
  });
  console.log(`  ✓ ${mockBehaviors.length} behavior records`);

  // Seed special cases
  const insertCase = db.prepare(`
    INSERT OR IGNORE INTO special_cases (id, student_id, reporter_id, title, description, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  mockSpecialCases.forEach((c) => {
    insertCase.run(
      c.id, c.studentId, defaultGuruId, c.title, c.description, c.category, c.status
    );
  });
  console.log(`  ✓ ${mockSpecialCases.length} special cases`);

  // Seed notifications
  const insertNotif = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, user_id, type, title, message, link_url, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  mockNotifications.forEach((n) => {
    insertNotif.run(n.id, n.userId, n.type, n.title, n.message, n.linkUrl, n.isRead ? 1 : 0);
  });
  console.log(`  ✓ ${mockNotifications.length} notifications`);

  // Seed reminder settings
  db.prepare(`
    INSERT OR IGNORE INTO reminder_settings (id, day_of_week, time, timezone, message, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run("reminder-001", "thursday", "14:00", "Asia/Jakarta", "Mohon lengkapi input perkembangan santri pekan ini.");

  // Seed subjects
  const insertSubject = db.prepare("INSERT OR IGNORE INTO subjects (id, name) VALUES (?, ?)");
  insertSubject.run("subject-001", "Tahfidz Qur'an");
  insertSubject.run("subject-002", "Adab & Akhlak");
  insertSubject.run("subject-003", "Berhitung");
  insertSubject.run("subject-004", "Calistung");
  insertSubject.run("subject-005", "Fiqih Ibadah");

  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);