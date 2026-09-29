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

const url = process.env.TURSO_DATABASE_URL || "file:data/simas.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client: Client = createClient({ url, authToken });

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
        const rs = await client.execute({ sql, args: toArgs(params) });
        return rs.rows as unknown as T[];
      },
      async get<T>(...params: unknown[]): Promise<T | undefined> {
        const rs = await client.execute({ sql, args: toArgs(params) });
        return rs.rows.length > 0 ? (rs.rows[0] as unknown as T) : undefined;
      },
      async run(...params: unknown[]): Promise<RunResult> {
        const rs = await client.execute({ sql, args: toArgs(params) });
        return {
          changes: rs.rowsAffected,
          lastInsertRowid: Number(rs.lastInsertRowid ?? 0),
        };
      },
    };
  },

  async exec(sql: string): Promise<void> {
    await client.executeMultiple(sql);
  },

  /** Akses client mentah (untuk kebutuhan khusus / batch). */
  raw: client,
};

export default db;
