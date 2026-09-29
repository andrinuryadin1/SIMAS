/**
 * setup-vercel-env.mjs
 * Set environment variables di Vercel project untuk production.
 * 
 * Cara pakai:
 *   node scripts/setup-vercel-env.mjs
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "";
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_KltBEbHBgSwfRJg0wjfioF1kQ1lT";
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || "";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

const BASE_URL = `https://api.vercel.com/v9/projects/${PROJECT_ID}`;
const HEADERS = {
  "Authorization": `Bearer ${VERCEL_TOKEN}`,
  "Content-Type": "application/json",
};

// Env vars yang akan di-set untuk production dan preview
const ENV_VARS = [
  { key: "TURSO_DATABASE_URL",  value: TURSO_DATABASE_URL,  target: ["production", "preview"] },
  { key: "TURSO_AUTH_TOKEN",    value: TURSO_AUTH_TOKEN,    target: ["production", "preview"] },
  { key: "NEXTAUTH_SECRET",     value: NEXTAUTH_SECRET,     target: ["production", "preview"] },
  // NEXTAUTH_URL akan diset saat deployment karena butuh domain yang aktif
];

async function getExistingEnvs() {
  const res = await fetch(`${BASE_URL}/env`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Failed to get envs: ${res.statusText}`);
  const data = await res.json();
  return data.envs || [];
}

async function deleteEnv(envId) {
  const res = await fetch(`${BASE_URL}/env/${envId}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  return res.ok;
}

async function createEnv(key, value, target) {
  const res = await fetch(`${BASE_URL}/env`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify([{ key, value, target, type: "encrypted" }]),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  ❌ Gagal set ${key}:`, JSON.stringify(data));
    return false;
  }
  return true;
}

async function setupEnv() {
  console.log("🔧 Mengkonfigurasi environment variables di Vercel...\n");

  // Ambil env vars yang sudah ada
  const existing = await getExistingEnvs();
  console.log(`📋 Env vars yang sudah ada: ${existing.length}`);

  // Hapus env yang sudah ada untuk keys yang akan kita set (hindari duplikat)
  const keysToSet = new Set(ENV_VARS.map(e => e.key));
  const toDelete = existing.filter(e => keysToSet.has(e.key));
  
  if (toDelete.length > 0) {
    console.log(`🗑  Menghapus ${toDelete.length} env lama yang akan diganti...`);
    for (const env of toDelete) {
      await deleteEnv(env.id);
      console.log(`   ✓ Deleted: ${env.key} (${env.target?.join(", ")})`);
    }
  }

  console.log("\n➕ Menambahkan env vars baru...");
  for (const env of ENV_VARS) {
    const ok = await createEnv(env.key, env.value, env.target);
    if (ok) {
      console.log(`   ✅ ${env.key} → [${env.target.join(", ")}]`);
    }
  }

  // Cek juga apakah NEXTAUTH_URL sudah ada untuk production
  const hasNextAuthUrlProd = existing.some(
    e => e.key === "NEXTAUTH_URL" && e.target?.includes("production")
  );
  
  if (!hasNextAuthUrlProd) {
    console.log("\n⚠  NEXTAUTH_URL belum di-set untuk production.");
    console.log("   Setelah deploy, dapatkan domain Vercel dan jalankan:");
    console.log("   npx vercel env add NEXTAUTH_URL production");
    console.log("   (masukkan: https://your-project.vercel.app)");
  }

  console.log("\n✅ Environment variables berhasil dikonfigurasi!");
  console.log("\n📌 Langkah selanjutnya:");
  console.log("   1. Jalankan: npx vercel --prod");
  console.log("   2. Setelah dapat domain, set NEXTAUTH_URL di Vercel dashboard");
}

setupEnv().catch((err) => {
  console.error("❌ Gagal:", err.message);
  process.exit(1);
});
