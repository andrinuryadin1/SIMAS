import "server-only";
import { createClient, type Client, type InValue } from "@libsql/client";

/**
 * Data access layer SiMas.
 *
 * Backend: Turso (libSQL) via HTTP. Ini juga bisa jalan lokal tanpa Turso —
 * kalau `TURSO_DATABASE_URL` tidak di-set, client otomatis memakai file SQLite
 * lokal (`data/simas.db`) memakai driver `file:` yang didukung @libsql/client.
 *
 * libSQL berbasis HTTP, jadi semua query adalah ASYNC. Wrapper di bawah
 * mempertahankan gaya pemanggilan yang mirip better-sqlite3 supaya diff
 * refurbishment lebih kecil:
 *
 *   const rows = await db.prepare("SELECT ...").all(id);
 *   const row  = await db.prepare("SELECT ...").get(id);
 *   const res  = await db.prepare("INSERT ...").run(a, b);
 *   await db.exec("PRAGMA ...");
 *
 * `prepare()` mengembalikan objek dengan method async, jadi `await` wajib
 * ditambahkan di setiap call site.
 */

const URL = process.env.TURSO_DATABASE_URL || "file:data/simas.db";
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Lazy singleton — client hanya dibuat saat query pertama dijalankan
let _client: Client | null = null;
let _useFallback = false;

function getClient(): Client {
  if (_client) return _client;

  const url = URL;
  const authToken = AUTH_TOKEN;

  try {
    _client = createClient({ url, authToken });
    // For non-file URLs (Turso HTTP), don't test connection here —
    // just let queries fail naturally and we'll handle errors per-query.
    // This avoids DNS lookups at module load time during build.
  } catch (e) {
    console.warn("Failed to create Turso client, falling back to local SQLite:", e);
    _useFallback = true;
    _client = createClient({ url: "file:data/simas.db" });
  }

  return _client;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

interface Statement {
  all<T = Record<string, unknown>>(...params: unknown[]): Promise<T[]>;
  get<T = Record<string, unknown>>(...params: unknown[]): Promise<T | undefined>;
  run(...params: unknown[]): Promise<RunResult>;
}

const toArgs = (params: unknown[]): InValue[] =>
  params.map((p) => (p === undefined || p === null ? null : (p as InValue)));

const db = {
  prepare(sql: string): Statement {
    return {
      async all<T>(...params: unknown[]): Promise<T[]> {
        try {
          const client = getClient();
          const rs = await client.execute({ sql, args: toArgs(params) });
          return rs.rows as unknown as T[];
        } catch (e) {
          console.error("DB query error (all):", e);
          return [];
        }
      },
      async get<T>(...params: unknown[]): Promise<T | undefined> {
        try {
          const client = getClient();
          const rs = await client.execute({ sql, args: toArgs(params) });
          return rs.rows.length > 0 ? (rs.rows[0] as unknown as T) : undefined;
        } catch (e) {
          console.error("DB query error (get):", e);
          return undefined;
        }
      },
      async run(...params: unknown[]): Promise<RunResult> {
        try {
          const client = getClient();
          const rs = await client.execute({ sql, args: toArgs(params) });
          return {
            changes: rs.rowsAffected,
            lastInsertRowid: Number(rs.lastInsertRowid ?? 0),
          };
        } catch (e) {
          console.error("DB query error (run):", e);
          return { changes: 0, lastInsertRowid: 0 };
        }
      },
    };
  },

  async exec(sql: string): Promise<void> {
    try {
      const client = getClient();
      await client.executeMultiple(sql);
    } catch (e) {
      console.error("DB exec error:", e);
    }
  },

  /** Akses client mentah (untuk kebutuhan khusus / batch). */
  get raw(): Client {
    return getClient();
  },
};

export default db;
