/**
 * scripts/simulate-dashboard.ts
 *
 * SIMULASI — tidak menyentuh database production.
 *
 * Jalankan query dashboard yang SAMA PERSIS dengan yang dipakai halaman
 * (lib/queries.ts: getAdminOverviewStats, getKelasStats, getGuruStats) di atas
 * sebuah database SQLite yang dibangun ulang dari nol (schema + migrasi +
 * seed). Tujuannya: lihat angka dashboard SEBENARNYA tanpa risiko.
 *
 * Cara pakai:
 *   SIM_DB=./data/sim.db npx tsx scripts/simulate-dashboard.ts
 *
 * Env var yang dipakai:
 *   SIM_DB        path file DB simulasi (default ./data/sim.db)
 *   SIM_TURSO_*   kalau diisi, pakai Turso (BAHAYA — jangan di production)
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const SIM_DB = process.env.SIM_DB ?? "./data/sim.db";
const useTurso = Boolean(process.env.TURSO_DATABASE_URL && !process.env.SIM_DB);

// db.ts membaca env ini saat di-import, jadi set SEBELAH client dibuat.
if (!useTurso) {
  fs.mkdirSync(path.dirname(SIM_DB), { recursive: true });
  // Hapus file lama + sidecar (-wal/-shm) supaya simulasi selalu dari nol.
  for (const suffix of ["", "-wal", "-shm"]) {
    const f = SIM_DB + suffix;
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch {
        fs.writeFileSync(f, "");
      }
    }
  }
  process.env.TURSO_DATABASE_URL = `file:${SIM_DB}`;
  delete process.env.TURSO_AUTH_TOKEN;
}

const client = useTurso
  ? createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  : createClient({ url: `file:${SIM_DB}` });

async function exec(sql: string) {
  try {
    await client.executeMultiple(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("SQL ERROR:", msg, "\n--- statement ---\n", sql.slice(0, 300));
    throw e;
  }
}

async function main() {
  // Impor dinamis SETELAH env di-set.
  const { SCHEMA_SQL } = await import("../lib/schema");
  const { runMigrations } = await import("../lib/migrations");
  const { seedDatabase } = await import("../lib/seed");
  const { getAdminOverviewStats, getKelasStats, getGuruStats } = await import("../lib/queries");

  const q = async <T>(sql: string, ...args: unknown[]) =>
    (await client.execute({ sql, args: args as never[] })).rows as unknown as T[];

  const one = async <T>(sql: string, ...args: unknown[]) => (await q<T>(sql, ...args))[0];

  function table(rows: unknown[]): string {
    if (!rows.length) return "  (kosong)";
    const cols = Object.keys(rows[0] as object);
    const w = cols.map((c) => Math.max(c.length, ...rows.map((r) => String((r as Record<string, unknown>)[c] ?? "").length)));
    const line = (vals: string[]) => "  " + vals.map((v, i) => v.padEnd(w[i])).join("  ");
    return [line(cols), "  " + w.map((n) => "-".repeat(n)).join("  "), ...rows.map((r) => line(cols.map((c) => String((r as Record<string, unknown>)[c] ?? ""))))].join("\n");
  }

  console.log("=".repeat(72));
  console.log(`SIMULASI DASHBOARD — ${useTurso ? "!! TURSO (hati-hati) !!" : SIM_DB}`);
  console.log("=".repeat(72));

  // --- Bangun DB dari nol, persis urutan init-db.ts -----------------------
  console.log("\n[1/4] Applying SCHEMA_SQL...");
  await exec(SCHEMA_SQL);

  console.log("[2/4] runMigrations()...");
  await runMigrations();

  console.log("[3/4] seedDatabase()...");
  await seedDatabase();

  console.log("[4/4] Membaca angka dashboard...\n");

  // --- Angka mentah per tabel ---------------------------------------------
  console.log("--- JUMLAH BARIS PER TABEL ---");
  const tables = (await q<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )).map((r) => r.name);
  const counts: Record<string, number> = {};
  for (const t of tables) counts[t] = Number((await one<{ c: number }>(`SELECT COUNT(*) AS c FROM "${t}"`))?.c ?? 0);
  console.log(table(Object.entries(counts).map(([t, c]) => ({ tabel: t, baris: c }))));

  // --- Integritas referensial: inilah yang bikin dashboard "0" ------------
  console.log("\n--- INTEGRITAS (penyebab dashboard kosong) ---");
  console.log(table([
    await one("SELECT COUNT(*) AS total, SUM(CASE WHEN kelas_id IS NULL THEN 1 ELSE 0 END) AS kelas_id_NULL, SUM(CASE WHEN class_id IS NULL THEN 1 ELSE 0 END) AS class_id_NULL FROM students"),
    await one("SELECT COUNT(*) AS total_kelas, SUM(CASE WHEN pembina IS NULL THEN 1 ELSE 0 END) AS pembina_NULL FROM kelas"),
  ]));

  const guruRows = await q<{ id: string; full_name: string }>("SELECT id, full_name FROM users WHERE role='guru'");
  console.log("\n--- COCOK users.full_name <-> kelas.pembina ---");
  for (const g of guruRows) {
    const k = await one<{ c: number }>("SELECT COUNT(*) AS c FROM kelas WHERE pembina = ?", g.full_name);
    const n = k?.c ?? 0;
    console.log(`  ${n > 0 ? "OK  " : "GAGAL"} ${g.full_name} -> ${n} kelas (getGuruStats hanya ambil 1)`);
  }
  if (!guruRows.length) console.log("  (tidak ada user role=guru di DB ini)");

  // --- Angka dashboard resmi ---------------------------------------------
  console.log("\n" + "=".repeat(72));
  console.log("ANGKA DASHBOARD (fungsi asli dari lib/queries.ts)");
  console.log("=".repeat(72));

  const overview = await getAdminOverviewStats();
  console.log("\n[getAdminOverviewStats] — kartu ringkasan Manajemen");
  console.log(table(Object.entries(overview).map(([k, v]) => ({ field: k, nilai: String(v) }))));

  const kelasStats = await getKelasStats();
  console.log(`\n[getKelasStats] — ${kelasStats.length} kelas`);
  console.log(table(kelasStats.map((k) => ({
    name: k.name, jenjang: k.jenjang_name, level: k.level_name,
    pembina: k.pembina ?? "(null)", siswa: k.studentCount,
    hadir_pct: `${k.avgAttendancePct}%`, hafalan_juz: k.totalHafalanJuz,
  }))));

  console.log("\n[getGuruStats] — per guru");
  for (const g of guruRows) {
    const s = await getGuruStats(g.id);
    console.log(`  ${g.full_name}: siswa=${s.myStudents} hadir=${s.myAttendancePct}% kasus=${s.myActiveCases} kelas=${s.myKelasName ?? "(tidak ada)"}`);
  }
  if (!guruRows.length) console.log("  (tidak ada user role=guru)");

  // --- Ringkasan diagnostik ----------------------------------------------
    console.log("\n" + "=".repeat(72));
    console.log("DIAGNOSIS");
    console.log("=".repeat(72));
    const issues: string[] = [];
    if (counts.students > 0 && counts.kelas > 0) {
    const nullKelas = Number((await one<{ n: number }>("SELECT COUNT(*) AS n FROM students WHERE kelas_id IS NULL"))?.n ?? 0);
    if (nullKelas === counts.students) issues.push(`SEMUA ${counts.students} student punya kelas_id NULL -> semua statistik per-kelas = 0. Seed tidak mengisi kolom kelas_id.`);
    else if (nullKelas > 0) issues.push(`${nullKelas}/${counts.students} student punya kelas_id NULL.`);
  }
  // getGuruStats sekarang menjumlahkan SEMUA kelas pembina (tanpa LIMIT 1),
  const dupePembina = await q<{ pembina_id: string; n: number }>(
    "SELECT pembina_id, COUNT(*) AS n FROM kelas WHERE pembina_id IS NOT NULL GROUP BY pembina_id HAVING n > 1"
  );
  if (dupePembina.length)
    console.log(`  info: ${dupePembina.length} pembina membina >1 kelas — sudah dijumlahkan semua.`);

  const kelasTanpaPembina = await q<{ name: string }>("SELECT name FROM kelas WHERE pembina_id IS NULL");
  if (kelasTanpaPembina.length > 0)
    issues.push(
      `${kelasTanpaPembina.length} kelas tanpa pembina_id (${kelasTanpaPembina.map((k) => k.name).join(", ")}) — tidak masuk statistik guru.`
    );

  // Setiap user role=guru harus punya minimal satu kelas.
  for (const g of guruRows) {
    const n = Number((await one<{ c: number }>("SELECT COUNT(*) AS c FROM kelas WHERE pembina_id = ?", g.id))?.c ?? 0);
    if (n === 0) issues.push(`Guru "${g.full_name}" tidak memiliki kelas (pembina_id kosong) -> dashboard guru 0.`);
  }
  const now = new Date(); const monthStart = now.toISOString().slice(0, 8) + "01";
    const recent = Number((await one<{ n: number }>("SELECT COUNT(*) AS n FROM attendance WHERE date >= ?", monthStart))?.n ?? 0);
    if (recent === 0) issues.push(`Tidak ada attendance bulan ini (>= ${monthStart}) -> rata-rata kehadiran 0%. Mock data mungkin sudah lama.`);
    const recentHaf = Number((await one<{ n: number }>("SELECT COUNT(*) AS n FROM memorization WHERE date >= ?", monthStart))?.n ?? 0);
    if (recentHaf === 0) issues.push(`Tidak ada hafalan bulan ini (>= ${monthStart}) -> totalHafalanJuz 0%.`);
    if (counts.behaviors === 0 && counts.students > 0)
      issues.push('Tabel behaviors kosong padahal seed melaporkan "successfully" — FK gagal diam-diam (id mock "student-1" vs DB "student-001").');

    if (!issues.length) console.log("  Tidak ada masalah terdeteksi.");
    else issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));

    // --- Perbaikan hipotetis (hanya di DB simulasi) -------------------------
    if (process.env.SIM_FIX === "1") {
      console.log("\n" + "=".repeat(72));
      console.log("SIMULASI PERBAIKAN — hanya di DB simulasi");
      console.log("=".repeat(72));
      console.log("(1) isi kelas_id  (2) rapikan id behaviors  (3) hitung semua kelas pembina\n");

      await exec(`
        UPDATE students SET kelas_id = (
          SELECT k.id FROM kelas k
          WHERE k.jenjang_name = (SELECT c.name FROM classes c WHERE c.id = students.class_id)
          ORDER BY k.name LIMIT 1
        )
        WHERE kelas_id IS NULL AND class_id IN (SELECT id FROM classes);
      `);
      const filled = Number((await one<{ n: number }>("SELECT COUNT(*) AS n FROM students WHERE kelas_id IS NOT NULL"))?.n ?? 0);
      console.log(`  (1) kelas_id terisi: ${filled}/${counts.students}`);

      await exec(`
        UPDATE behaviors SET student_id = 'student-' || substr('00' || student_id, -3)
        WHERE student_id NOT IN (SELECT id FROM students);
      `);
      console.log(`  (2) behaviors: ${(await one<{ c: number }>("SELECT COUNT(*) AS c FROM behaviors"))?.c ?? 0} baris\n`);

      console.log("  (3) Statistik jika getGuruStats menjumlahkan SEMUA kelas pembina:");
      for (const g of guruRows) {
        const n = Number((await one<{ n: number }>(
          "SELECT COUNT(*) AS n FROM students WHERE status='aktif' AND kelas_id IN (SELECT id FROM kelas WHERE pembina = ?)",
          g.full_name
        ))?.n ?? 0);
        const kelas = (await q<{ name: string }>("SELECT name FROM kelas WHERE pembina = ? ORDER BY name", g.full_name)).map((x) => x.name);
        console.log(`      ${g.full_name}: siswa=${n} (${kelas.join(", ") || "tidak ada"})`);
      }

      // Angka dashboard setelah perbaikan
      const ov2 = await getAdminOverviewStats();
      console.log("\n  [getAdminOverviewStats] SETELAH PERBAIKAN");
      console.log(table(Object.entries(ov2).map(([k, v]) => ({ field: k, nilai: String(v) }))));
      const ks2 = await getKelasStats();
      console.log(`\n  [getKelasStats] SETELAH PERBAIKAN`);
      console.log(table(ks2.map((k) => ({
        name: k.name, jenjang: k.jenjang_name, pembina: k.pembina ?? "(null)",
        siswa: k.studentCount, hadir_pct: `${k.avgAttendancePct}%`, hafalan_juz: k.totalHafalanJuz,
      }))));
    }

    console.log(`\nDB simulasi: ${SIM_DB} (hapus dengan: rm ${SIM_DB})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
