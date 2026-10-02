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

/**
 * Mode ketat.
 *
 * Default (false): error query di-log lalu ditelan — `all` -> [], `get` ->
 * undefined, `run` -> { changes: 0 }. Ini yang dipakai halaman baca, supaya
 * satu query rusak tidak menjatuhkan seluruh request.
 *
 * `db.strict(true)` membuat semua operasi MEMLEMPARKAN error. Wajib untuk
 * migrasi & seed: sebelumnya seed bisa gagal diam-diam (mis. FK parent
 * tidak ada) tapi tetap mencetak "seeded successfully" dengan centang hijau,
 * sehingga tabel berakhir kosong tanpa ada yang menyadari.
 */
let strict = false;

const sqlPreview = (sql: string) => sql.replace(/\s+/g, " ").trim().slice(0, 160);

const db = {
  /** Nyalakan atau matikan mode ketat. Dipakai init-db, migrasi, dan seed. */
  strict(on = true) {
    strict = on;
    return db;
  },

  /** Status mode ketat — untuk keperluan diagnostik. */
  get isStrict() {
    return strict;
  },

  prepare(sql: string): Statement {
    return {
      async all<T>(...params: unknown[]): Promise<T[]> {
        try {
          const client = getClient();
          const rs = await client.execute({ sql, args: toArgs(params) });
          return rs.rows as unknown as T[];
        } catch (e) {
          console.error(`DB query error (all) [${sqlPreview(sql)}]:`, e);
          if (strict) throw e;
          return [];
        }
      },
      async get<T>(...params: unknown[]): Promise<T | undefined> {
        try {
          const client = getClient();
          const rs = await client.execute({ sql, args: toArgs(params) });
          return rs.rows.length > 0 ? (rs.rows[0] as unknown as T) : undefined;
        } catch (e) {
          console.error(`DB query error (get) [${sqlPreview(sql)}]:`, e);
          if (strict) throw e;
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
          console.error(`DB query error (run) [${sqlPreview(sql)}]:`, e);
          if (strict) throw e;
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
      console.error(`DB exec error [${sqlPreview(sql)}]:`, e);
      if (strict) throw e;
    }
  },

  /** Akses client mentah (untuk kebutuhan khusus / batch). */
  get raw(): Client {
    return getClient();
  },
};

export default db;
