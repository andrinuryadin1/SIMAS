/**
 * lib/migrations.ts
 *
 * Migrasi aditif untuk database yang SUDAH ADA.
 *
 * `SCHEMA_SQL` memakai `CREATE TABLE IF NOT EXISTS`, jadi statement itu hanya
 * berlaku untuk tabel baru. Database lama yang sudah punya tabel `students` /
 * `progress_aspects` tidak akan otomatis mendapat kolom baru yang ditambahkan
 * ke `SCHEMA_SQL`. Itu sebabnya migrasi tambahan diletakkan di sini.
 *
 * Aturan main:
 *   - Hanya operasi yang ADITIF (tambah kolom / tambah tabel / tambah index).
 *   - WAJIB idempotent: dicek dulu lewat `PRAGMA table_info` sebelum
 *     `ALTER TABLE ... ADD COLUMN` dijalankan, karena SQLite gagal kalau kolom
 *     sudah ada.
 *   - Tidak pernah menghapus atau mengubah tipe kolom yang sudah ada.
 */
import db from "@/lib/db";

interface TableInfoRow {
  name: string;
}

async function getColumns(table: string): Promise<Set<string>> {
  const rows = await db.prepare(`PRAGMA table_info(${table})`).all<TableInfoRow>();
  return new Set(rows.map((r) => r.name));
}

async function getTables(): Promise<Set<string>> {
  const rows = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all<{ name: string }>();
  return new Set(rows.map((r) => r.name));
}

async function tableExists(table: string): Promise<boolean> {
  const tables = await getTables();
  return tables.has(table);
}

async function addColumnsIfMissing(
  table: string,
  columns: Record<string, string>
): Promise<number> {
  if (!(await tableExists(table))) return 0;

  const existing = await getColumns(table);
  let added = 0;

  for (const [column, definition] of Object.entries(columns)) {
    if (existing.has(column)) continue;
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    added++;
    console.log(`[migrations] ${table}.${column} ditambahkan`);
  }

  return added;
}

async function createIndexIfMissing(
  index: string,
  sql: string
): Promise<boolean> {
  const rows = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name = ?")
    .all(index);
  if (rows.length > 0) return false;
  await db.prepare(sql).run();
  console.log(`[migrations] index ${index} dibuat`);
  return true;
}

/**
 * Jalankan semua migrasi aditif. Aman dipanggil berkali-kali.
 * Dipanggil dari `lib/init-db.ts` SESUDAH `SCHEMA_SQL` dieksekusi.
 */
export async function runMigrations(): Promise<void> {
  const changes: string[] = [];

  // --- Tabel baru ---------------------------------------------------------
  // `kelas` sudah dibuat oleh SCHEMA_SQL, tapi tetap dijaga di sini supaya
  // aman kalau SCHEMA_SQL dijalankan pada database lama yang tabelnya belum ada.
  if (!(await tableExists("kelas"))) {
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS kelas (
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           level_id TEXT,
           level_name TEXT,
           jenjang_name TEXT,
           capacity INTEGER DEFAULT 30,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )`
      )
      .run();
    changes.push("tabel kelas");
  }

  // --- Kolom baru ---------------------------------------------------------
  const added = await addColumnsIfMissing("students", {
    kelas_id: "TEXT",
    kelas_name: "TEXT",
  });
  if (added > 0) changes.push("students.kelas_id, students.kelas_name");

  const addedAspects = await addColumnsIfMissing("progress_aspects", {
    kelas: "TEXT",
  });
  if (addedAspects > 0) changes.push("progress_aspects.kelas");

  // --- Index baru ---------------------------------------------------------
  if (
    await createIndexIfMissing(
      "idx_progress_aspects_kelas",
      "CREATE INDEX IF NOT EXISTS idx_progress_aspects_kelas ON progress_aspects(kelas)"
    )
  ) {
    changes.push("index idx_progress_aspects_kelas");
  }

  if (changes.length > 0) {
    console.log(`[migrations] ${changes.length} perubahan diterapkan: ${changes.join(", ")}`);
  } else {
    console.log("[migrations] Skema sudah terbaru, tidak ada perubahan.");
  }
}
