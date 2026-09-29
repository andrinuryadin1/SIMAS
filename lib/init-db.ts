/**
 * lib/init-db.ts
 *
 * Inisialisasi database saat server start:
 *   1. Pastikan schema (tabel + index) ada — `CREATE TABLE IF NOT EXISTS` jadi
 *      aman dijalankan berulang kali.
 *   2. Seed data awal kalau tabel masih kosong.
 *
 * Dipanggil dari `instrumentation.ts`, TIDAK dari `app/layout.tsx`, supaya
 * tidak dieksekusi pada build time.
 */
import db from "@/lib/db";
import { SCHEMA_SQL } from "@/lib/schema";
import { seedDatabase } from "@/lib/seed";

let initPromise: Promise<void> | null = null;

async function run(): Promise<void> {
  try {
    await db.exec(SCHEMA_SQL);
    await seedDatabase();
  } catch (error) {
    // Jangan sampai server gagal start hanya karena DB belum reachable.
    // Request berikutnya akan tetap mencoba query dan menampilkan error yang
    // berguna di UI / log.
    console.error("[init-db] Failed to initialize database:", error);
  }
}

export function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = run();
  }
  return initPromise;
}
