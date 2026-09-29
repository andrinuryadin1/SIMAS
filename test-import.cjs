const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "data", "simas.db");
const db = new Database(dbPath);

// 1. Simulate the reset-data endpoint
const tables = [
  "attendance",
  "quran_memorization",
  "adab_assessments",
  "behaviors",
  "progress_records",
  "teaching_journals",
  "special_cases",
  "case_follow_ups",
  "notifications",
  "students",
];

console.log("=== RESET DATA ===");
db.pragma("foreign_keys = OFF");
for (const t of tables) {
  try {
    const r = db.prepare("DELETE FROM " + t).run();
    console.log("  " + t + ": deleted " + r.changes);
  } catch (e) {
    console.log("  " + t + ": skipped (" + e.message + ")");
  }
}
db.pragma("foreign_keys = ON");
console.log("  students remaining: " + db.prepare("SELECT COUNT(*) c FROM students").get().c);

// 2. Simulate the import endpoint logic
console.log("");
console.log("=== IMPORT SANTRI (CSV) ===");

const csv = [
  "nis,full_name,gender,birth_date,birth_place,class_name,halaqah,address,guardian_phone",
  "2024001,Ahmad Fauzi,L,2012-03-15,Bandung,Kuttab Awal,Kuttab Awal 1,Jl. Merdeka No. 10,081234567890",
  "2024002,Siti Aminah,P,2012-07-22,Cimahi,Kuttab Awal,Kuttab Awal 2,Jl. Asia Afrika No. 5,081298765432",
  "2024003,Muhammad Rizki,L,2011-12-01,Bandung,Qonuni,Qonuni 1,Jl. Cendana No. 8,08111223344",
  "DUPLICATE-NIS,Mustafa,H,invalid-date,X,Kuttab Awal,,,,",
].join("\n");

const Papa = require("papaparse");
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

const classes = db.prepare("SELECT id, name FROM classes").all();
const halaqahs = db.prepare("SELECT id, name FROM halaqahs").all();
const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c.id]));
const halaqahMap = new Map(halaqahs.map((h) => [h.name.toLowerCase(), h.id]));

console.log("  classes: " + JSON.stringify(classes));
console.log("  halaqahs available: " + halaqahs.length);

const insert = db.prepare(
  "INSERT INTO students (id, nis, full_name, gender, birth_date, birth_place, address, class_id, class_name, halaqah_id, academic_year_id, enrollment_date, father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

let success = 0;
let failed = 0;
const errors = [];

parsed.data.forEach((record, i) => {
  const rowNum = i + 2;
  const required = ["nis", "full_name", "gender", "birth_date", "birth_place", "class_name"];
  const missing = required.filter((f) => !record[f]);
  if (missing.length) {
    failed++;
    errors.push("Baris " + rowNum + ": field wajib hilang: " + missing.join(", "));
    return;
  }
  if (!["L", "P", "M"].includes(record.gender.toUpperCase())) {
    failed++;
    errors.push("Baris " + rowNum + ": gender harus L/P");
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.birth_date)) {
    failed++;
    errors.push("Baris " + rowNum + ": format birth_date harus YYYY-MM-DD");
    return;
  }
  const dup = db.prepare("SELECT id FROM students WHERE nis = ?").get(record.nis);
  if (dup) {
    failed++;
    errors.push("Baris " + rowNum + ": NIS " + record.nis + " sudah terdaftar");
    return;
  }

  insert.run(
    "student-" + Date.now() + "-" + i,
    record.nis,
    record.full_name,
    record.gender.toUpperCase(),
    record.birth_date,
    record.birth_place,
    record.address || null,
    classMap.get(record.class_name.toLowerCase()) || null,
    record.class_name,
    halaqahMap.get((record.halaqah || "").toLowerCase()) || null,
    null,
    "2024-07-01",
    null,
    null,
    null,
    record.guardian_phone || null,
    null,
    "aktif",
    null
  );
  success++;
});

console.log("  success: " + success);
console.log("  failed: " + failed);
errors.forEach((e) => console.log("    - " + e));

console.log("");
console.log("=== VERIFY ===");
const rows = db.prepare("SELECT nis, full_name, gender, class_name, halaqah_id, guardian_phone FROM students").all();
console.log(JSON.stringify(rows, null, 2));

// Cleanup
db.prepare("DELETE FROM students").run();
console.log("");
console.log("Cleanup: students cleared -> " + db.prepare("SELECT COUNT(*) c FROM students").get().c);

db.close();
