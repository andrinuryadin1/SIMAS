const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(process.cwd(), "data", "simas.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = OFF");

const tables = [
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
];

console.log("=== RESET OPERATIONAL ===");
for (const t of tables) {
  try {
    const r = db.prepare("DELETE FROM " + t).run();
    console.log("  " + t + ": deleted " + r.changes);
  } catch (e) {
    console.log("  " + t + ": skipped");
  }
}
db.pragma("foreign_keys = ON");

console.log("\n=== ENSURE REFERENCE ===");
const insertClass = db.prepare("INSERT OR IGNORE INTO classes (id, name, capacity) VALUES (?, ?, ?)");
insertClass.run("class-ka", "Kuttab Awal", 30);
insertClass.run("class-qo", "Qonuni", 30);
console.log("  classes ok");

const insertHalaqah = db.prepare("INSERT OR IGNORE INTO halaqahs (id, name, pembina) VALUES (?, ?, ?)");
insertHalaqah.run("level-ka-1", "Kuttab Awal 1", "Ustadz Rizki Firmansyah");
insertHalaqah.run("level-ka-2", "Kuttab Awal 2", "Ustadzah Sari Amelia");
insertHalaqah.run("level-ka-3", "Kuttab Awal 3", "Ustadz Hilmi Rahman");
insertHalaqah.run("level-qo-1", "Qonuni 1", "Ustadz Rizki Firmansyah");
insertHalaqah.run("level-qo-2", "Qonuni 2", "Ustadzah Sari Amelia");
insertHalaqah.run("level-qo-3", "Qonuni 3", "Ustadz Hilmi Rahman");
insertHalaqah.run("level-qo-4", "Qonuni 4", null);
console.log("  halaqahs ok");

const insertYear = db.prepare("INSERT OR IGNORE INTO academic_years (id, name, semester, is_active) VALUES (?, ?, ?, ?)");
insertYear.run("ay-001", "2024/2025", "ganjil", 0);
insertYear.run("ay-002", "2025/2026", "ganjil", 1);
console.log("  academic_years ok");

const subjects = [
  "Tahfidz Qur'an",
  "Adab & Akhlak",
  "Berhitung",
  "Calistung",
  "Fiqih Ibadah",
];
const insertSubject = db.prepare("INSERT OR IGNORE INTO subjects (id, name) VALUES (?, ?)");
subjects.forEach((name, i) => insertSubject.run("subject-" + String(i + 1).padStart(3, "0"), name));
console.log("  subjects ok");

console.log("\n=== RESEED USERS ===");
const hash = bcrypt.hashSync("password123", 10);
const insertUser = db.prepare("INSERT OR REPLACE INTO users (id, email, password, full_name, role, phone, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?, NULL, 'active')");
insertUser.run("admin-001", "admin@kuttabal-fatih.sch.id", hash, "Admin SiMas", "admin", null);
insertUser.run("guru-001", "rizki.firmansyah@kuttabal-fatih.sch.id", hash, "Ustadz Rizki Firmansyah", "guru", "08123456789");
insertUser.run("manajemen-001", "hendra.wijaya@kuttabal-fatih.sch.id", hash, "Ustadz Hendra Wijaya", "manajemen", "08123456780");
console.log("  users recreated");

console.log("\n=== DONE ===");
console.log("Students:", db.prepare("SELECT COUNT(*) c FROM students").get().c);
console.log("Users:", db.prepare("SELECT COUNT(*) c FROM users").get().c);
console.log("Classes:", db.prepare("SELECT COUNT(*) c FROM classes").get().c);
console.log("Halaqahs:", db.prepare("SELECT COUNT(*) c FROM halaqahs").get().c);
console.log("Subjects:", db.prepare("SELECT COUNT(*) c FROM subjects").get().c);
console.log("Academic years:", db.prepare("SELECT COUNT(*) c FROM academic_years").get().c);

db.close();