/**
 * check-turso.mjs — diagnoses the Turso connection + schema state.
 * Run: node scripts/check-turso.mjs
 */
import { readFileSync } from "fs";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
console.log("URL     :", url);
console.log("TOKEN   :", authToken ? `${authToken.slice(0, 8)}... (len ${authToken.length})` : "(missing)");

const client = createClient({ url, authToken });
try {
  const r = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const tables = r.rows.map((x) => x.name);
  console.log("CONNECT : OK");
  console.log("TABLES  :", tables.length ? tables.join(", ") : "(none)");
  const uc = await client.execute("SELECT COUNT(*) AS c FROM users");
  console.log("USERS   :", uc.rows[0].c);
} catch (e) {
  console.log("CONNECT : FAIL");
  console.log("  message :", e.message);
  console.log("  code    :", e.cause?.code);
  console.log("  hostname:", e.cause?.hostname ?? e.cause?.host);
  console.log("  errno   :", e.cause?.errno);
}
client.close();
