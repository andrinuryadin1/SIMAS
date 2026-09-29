/**
 * instrumentation.ts
 *
 * Dijalankan sekali saat Next.js server instance start. Ini tempat yang benar
 * untuk inisialisasi database (schema + seed) — BUKAN di `app/layout.tsx`.
 *
 * Kenapa tidak di layout?
 *   `app/layout.tsx` ikut di-evaluasi pada build time ("Collecting page data"
 *   dan "Generating static pages"). Kalau inisialisasi DB ada di sana, setiap
 *   build akan mencoba koneksi ke Turso. Kalau DNS/network tidak tersedia di
 *   environment build, build gagal dan seluruh halaman tidak ter-deploy.
 *
 * Catatan: `register()` dipanggil di semua environment, jadi kita wajib
 * skip saat phase build.
 */
export async function register() {
  // Hanya Node.js runtime — libSQL tidak jalan di Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Jangan sentuh database saat `next build`.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { initializeDatabase } = await import("./lib/init-db");
  await initializeDatabase();
}
