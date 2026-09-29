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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tables = [
  "users", "students", "classes", "halaqahs", "attendance", "memorization",
  "adab_assessments", "behaviors", "progress_records", "teaching_journals",
  "special_cases", "case_follow_ups", "notifications", "academic_years",
  "subjects", "reminder_settings", "progress_aspects",
];

for (const t of tables) {
  const r = await client.execute(`SELECT COUNT(*) AS c FROM ${t}`);
  console.log(t.padEnd(22), r.rows[0].c);
}

console.log("\n--- users ---");
const u = await client.execute("SELECT id, email, role, status, full_name FROM users");
for (const row of u.rows) {
  console.log(`${row.id} | ${row.email} | ${row.role} | ${row.status} | ${row.full_name}`);
}

console.log("\n--- reminder_settings ---");
const rs = await client.execute("SELECT * FROM reminder_settings");
for (const row of rs.rows) console.log(JSON.stringify(row));

client.close();
