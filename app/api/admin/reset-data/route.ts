import { NextResponse } from "next/server";
import { getSessionOrError } from "@/lib/api-utils";
import { resetOperationalData } from "@/lib/data-reset";

/**
 * POST /api/admin/reset-data
 * Menghapus seluruh data operasional (santri, absensi, hafalan, dst).
 * User yang login dan data referensi (kelas, level, tahun ajaran, mapel) tetap utuh.
 */
export async function POST() {
  const { error } = await getSessionOrError(["admin"]);
  if (error) return error;

  try {
    const summary = await resetOperationalData();
    const total = summary.reduce((sum, row) => sum + row.deleted, 0);

    return NextResponse.json({
      message: `Data berhasil direset (${total} baris dihapus). Akun login dan data referensi tetap tersedia.`,
      deleted: total,
      tables: summary,
    });
  } catch (err) {
    console.error("Reset data error:", err);
    return NextResponse.json({ error: "Gagal mereset data" }, { status: 500 });
  }
}
