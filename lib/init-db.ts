/**
 * lib/init-db.ts
 *
 * Inisialisasi database saat server start:
 *   1. Pastikan schema (tabel + index) ada — `CREATE TABLE IF NOT EXISTS` jadi
 *      aman dijalankan berulang kali.
 *   2. Jalankan migrasi aditif (kolom/index baru pada tabel yang sudah ada).
 *   3. Seed data awal kalau tabel masih kosong.
 *
 * Dipanggil dari `instrumentation.ts`, TIDAK dari `app/layout.tsx`, supaya
 * tidak dieksekusi pada build time.
 */
import db from "@/lib/db";
import { SCHEMA_SQL } from "@/lib/schema";
import { runMigrations } from "@/lib/migrations";
import { seedDatabase } from "@/lib/seed";

let initPromise: Promise<void> | null = null;

async function run(): Promise<void> {
  // Mode ketat: migrasi & seed HARUS gagal keras kalau ada error, bukan
  // menelan error diam-diam. Tanpa ini, seed yang gagal diam-diam tetap
  // mencetak "successfully" dan menyisakan database kosong.
  db.strict(true);
  try {
    await db.exec(SCHEMA_SQL);
    await runMigrations();
    await seedDatabase();
  } catch (error) {
    // Jangan sampai server gagal start hanya karena DB belum reachable.
    // Request berikutnya akan tetap mencoba query dan menampilkan error yang
    // berguna di UI / log.
    console.error("[init-db] Failed to initialize database:", error);
  } finally {
    db.strict(false);
  }
}

export function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = run();
  }
  return initPromise;
}
