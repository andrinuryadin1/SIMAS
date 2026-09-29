/**
 * lib/auth-helpers.ts
 *
 * Helper database untuk NextAuth. File ini SENGAJA tidak memakai `server-only`
 * agar bisa diimpor oleh `auth.ts` tanpa menyebabkan inisialisasi NextAuth gagal
 * saat Next.js build "collect page data" phase.
 *
 * Untuk query database umum, tetap gunakan `lib/db.ts`.
 */
import { createClient, type Client } from "@libsql/client";

// Environment variables are read lazily inside getClient() to avoid DNS lookups
// during module import (which would happen in the Next.js build phase).

let _client: Client | null = null;
let _useFallback = false;

function getClient(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL || "file:data/simas.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  try {
    _client = createClient({ url, authToken });
  } catch (e) {
    console.warn("Failed to create Turso client for auth-helpers, falling back to local SQLite:", e);
    _useFallback = true;
    _client = createClient({ url: "file:data/simas.db" });
  }

  return _client;
}

export interface DbUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  status: string;
}

/**
 * Cari user berdasarkan email dan role untuk keperluan login.
 * Hanya mengembalikan user yang statusnya 'active'.
 */
export async function getUserByEmailAndRole(
  email: string,
  role: string
): Promise<DbUser | undefined> {
  const client = getClient();
  const rs = await client.execute({
    sql: "SELECT id, email, password, full_name, role, status FROM users WHERE email = ? AND role = ? AND status = 'active' LIMIT 1",
    args: [email, role],
  });
  return rs.rows[0] as unknown as DbUser | undefined;
}
