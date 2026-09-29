import { NextResponse } from "next/server";
import { getSessionOrError } from "@/lib/api-utils";
import { resetAndReseed, DEFAULT_PASSWORD } from "@/lib/data-reset";

/**
 * POST /api/admin/reseed
 * Menghapus data operasional + seluruh user, lalu membuat ulang akun dasar
 * (admin, guru, manajemen) beserta data referensi. Dipakai untuk mengembalikan
 * kondisi database ke kondisi demo yang bersih.
 */
export async function POST() {
  const { error } = await getSessionOrError(["admin"]);
  if (error) return error;

  try {
    const { summary, users } = await resetAndReseed();
    const total = summary.reduce((sum, row) => sum + row.deleted, 0);

    return NextResponse.json({
      message: `Database direset & di-seed ulang (${total} baris dihapus, ${users} akun dibuat).`,
      deleted: total,
      tables: summary,
      credentials: {
        password: DEFAULT_PASSWORD,
        accounts: [
          { role: "admin", email: "admin@kuttabal-fatih.sch.id" },
          { role: "guru", email: "rizki.firmansyah@kuttabal-fatih.sch.id" },
          { role: "manajemen", email: "hendra.wijaya@kuttabal-fatih.sch.id" },
        ],
      },
    });
  } catch (err) {
    console.error("Reseed error:", err);
    return NextResponse.json({ error: "Gagal re-seed database" }, { status: 500 });
  }
}
