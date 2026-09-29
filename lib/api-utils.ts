/**
 * lib/api-utils.ts
 * Helper terpusat untuk semua API routes:
 *  - Pengecekan session / autentikasi
 *  - Penjagaan role (role guard)
 *  - Respons error standar
 */
import "server-only";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export type AllowedRole = "admin" | "guru" | "manajemen";

/**
 * Mendapatkan sesi aktif.
 * Mengembalikan { session } jika valid, atau { error: NextResponse } jika tidak.
 */
export async function getSessionOrError(allowedRoles?: AllowedRole[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Tidak terautentikasi. Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (session.user as any).role as AllowedRole;
    if (!allowedRoles.includes(userRole)) {
      return {
        session: null,
        error: NextResponse.json(
          {
            error: `Akses ditolak. Halaman ini hanya untuk: ${allowedRoles.join(", ")}.`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { session, error: null };
}

/**
 * Membungkus body JSON request + validasi Zod secara bersamaan.
 * Mengembalikan { data } jika valid, atau { error: NextResponse } jika tidak.
 */
export async function parseBody<T>(
  request: Request,
  schema: { safeParse: (input: unknown) => { success: boolean; data?: T; error?: { format: () => unknown } } }
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: "Request body tidak valid (bukan JSON)." }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        { error: "Data tidak valid.", detail: result.error?.format() },
        { status: 422 }
      ),
    };
  }

  return { data: result.data as T, error: null };
}

/**
 * Membuat ID unik sederhana berbasis timestamp.
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
