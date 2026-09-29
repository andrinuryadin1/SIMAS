import { NextRequest, NextResponse } from "next/server";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import ExcelJS from "exceljs";
import { getSessionOrError } from "@/lib/api-utils";
import { getStudentReportData } from "@/lib/queries";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 9 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#064e3b" },
  subHeader: { fontSize: 11, color: "#334155" },
  section: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 6, color: "#0f172a" },
  empty: { fontSize: 9, fontStyle: "italic", color: "#64748b" },
  row: { flexDirection: "row" },
  statRow: { flexDirection: "row", marginBottom: 3 },
  statLabel: { width: 150, fontSize: 9, fontWeight: "bold", color: "#475569" },
  statValue: { fontSize: 9, color: "#1e293b" },
  th: {
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  td: { fontSize: 8, padding: 4 },
});

const GENDER: Record<string, string> = { L: "Laki-laki", P: "Perempuan" };

function StudentReportPdf({ data }: { data: NonNullable<Awaited<ReturnType<typeof getStudentReportData>>> }) {
  const { student, stats, attendance, memorization, behaviors, adabAssessments, progressRecords, cases } = data;

  return (
    <Document title={`Rekam Jejak Santri - ${student.full_name}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Rekam Jejak Santri</Text>
        <Text style={styles.subHeader}>Kuttab Al-Fatih Bandung</Text>
        <Text style={styles.subHeader}>
          Dicetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </Text>

        <Text style={styles.section}>A. Data Pribadi</Text>
        {[
          ["NIS", student.nis],
          ["Nama Lengkap", student.full_name],
          ["Jenis Kelamin", GENDER[student.gender] ?? student.gender],
          ["Tempat, Tgl Lahir", `${student.birth_place}, ${student.birth_date}`],
          ["Alamat", student.address ?? "-"],
          ["Kelas / Halaqah", `${student.class_name} / ${student.halaqah_name ?? "-"}`],
          ["Tanggal Daftar", student.enrollment_date ?? "-"],
          ["Ayah", student.father_name ?? "-"],
          ["Ibu", student.mother_name ?? "-"],
          ["Wali", `${student.guardian_name ?? "-"} (${student.guardian_phone ?? "-"})`],
          ["Status", student.status],
        ].map(([label, value]) => (
          <View key={label} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.section}>B. Ringkasan Kinerja</Text>
        {[
          ["Kehadiran", `${stats.attendance.hadir}/${stats.attendance.total} (${stats.attendance.percentage}%)`],
          ["Rincian Kehadiran", `Hadir ${stats.attendance.hadir}, Terlambat ${stats.attendance.terlambat}, Sakit ${stats.attendance.sakit}, Izin ${stats.attendance.izin}, Alpha ${stats.attendance.alpha}`],
          ["Total Ayat Hafalan", `${stats.memorization.totalAyahs} ayat`],
          ["Setoran Hafalan", `Ziyadah ${stats.memorization.ziyadahCount} x, Murojaah ${stats.memorization.murojaahCount} x`],
          ["Perilaku", `Positif ${stats.behaviors.positif}, Pelanggaran ${stats.behaviors.pelanggaran}, Berat ${stats.behaviors.berat}`],
          ["Rata-rata Adab", stats.adab.avgScore !== null ? `${stats.adab.avgScore}` : "-"],
          ["Kasus Khusus", `${cases.filter((c) => c.status !== "resolved").length} aktif dari ${cases.length} kasus`],
        ].map(([label, value]) => (
          <View key={label} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.section}>C. Riwayat Kehadiran (20 terbaru)</Text>
        {attendance.length === 0 ? (
          <Text style={styles.empty}>Belum ada data kehadiran.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 80 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 80 }]}>Status</Text>
              <Text style={styles.th}>Keterangan</Text>
            </View>
            {attendance.slice(0, 20).map((a: any) => (
              <View key={a.id} style={styles.row}>
                <Text style={[styles.td, { width: 80 }]}>{a.date}</Text>
                <Text style={[styles.td, { width: 80 }]}>{a.status}</Text>
                <Text style={styles.td}>{a.notes ?? "-"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>D. Riwayat Hafalan (20 terbaru)</Text>
        {memorization.length === 0 ? (
          <Text style={styles.empty}>Belum ada data hafalan.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 70 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 60 }]}>Jenis</Text>
              <Text style={[styles.th, { width: 110 }]}>Surah</Text>
              <Text style={[styles.th, { width: 55 }]}>Ayat</Text>
              <Text style={[styles.th, { width: 30 }]}>Juz</Text>
              <Text style={[styles.th, { width: 30 }]}>Nilai</Text>
              <Text style={styles.th}>Catatan</Text>
            </View>
            {memorization.slice(0, 20).map((m: any) => (
              <View key={m.id} style={styles.row}>
                <Text style={[styles.td, { width: 70 }]}>{m.date}</Text>
                <Text style={[styles.td, { width: 60 }]}>{m.type}</Text>
                <Text style={[styles.td, { width: 110 }]}>
                  {m.surah_name} ({m.surah_number})
                </Text>
                <Text style={[styles.td, { width: 55 }]}>
                  {m.ayah_start}:{m.ayah_end}
                </Text>
                <Text style={[styles.td, { width: 30 }]}>{m.juz ?? "-"}</Text>
                <Text style={[styles.td, { width: 30 }]}>{m.quality ?? "-"}</Text>
                <Text style={styles.td}>{m.note ?? "-"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>E. Riwayat Perilaku (20 terbaru)</Text>
        {behaviors.length === 0 ? (
          <Text style={styles.empty}>Belum ada data perilaku.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 70 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 60 }]}>Jenis</Text>
              <Text style={[styles.th, { width: 70 }]}>Kategori</Text>
              <Text style={[styles.th, { width: 50 }]}>Tingkat</Text>
              <Text style={[styles.th, { width: 140 }]}>Deskripsi</Text>
              <Text style={styles.th}>Tindakan</Text>
            </View>
            {behaviors.slice(0, 20).map((b: any) => (
              <View key={b.id} style={styles.row}>
                <Text style={[styles.td, { width: 70 }]}>{b.date}</Text>
                <Text style={[styles.td, { width: 60 }]}>{b.type}</Text>
                <Text style={[styles.td, { width: 70 }]}>{b.category}</Text>
                <Text style={[styles.td, { width: 50 }]}>{b.severity ?? "-"}</Text>
                <Text style={[styles.td, { width: 140 }]}>{b.description ?? "-"}</Text>
                <Text style={styles.td}>{b.action_taken ?? "-"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>F. Penilaian Adab</Text>
        {adabAssessments.length === 0 ? (
          <Text style={styles.empty}>Belum ada penilaian adab.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 70 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 60 }]}>Periode</Text>
              <Text style={[styles.th, { width: 50 }]}>Jujur</Text>
              <Text style={[styles.th, { width: 55 }]}>Mandiri</Text>
              <Text style={[styles.th, { width: 50 }]}>Sosial</Text>
              <Text style={[styles.th, { width: 55 }]}>Kebersihan</Text>
              <Text style={[styles.th, { width: 55 }]}>Disiplin</Text>
              <Text style={styles.th}>Rata-rata</Text>
            </View>
            {adabAssessments.map((a: any) => (
              <View key={a.id} style={styles.row}>
                <Text style={[styles.td, { width: 70 }]}>{a.date}</Text>
                <Text style={[styles.td, { width: 60 }]}>{a.period}</Text>
                <Text style={[styles.td, { width: 50 }]}>{a.score_honesty ?? "-"}</Text>
                <Text style={[styles.td, { width: 55 }]}>{a.score_independence ?? "-"}</Text>
                <Text style={[styles.td, { width: 50 }]}>{a.score_social ?? "-"}</Text>
                <Text style={[styles.td, { width: 55 }]}>{a.score_cleanliness ?? "-"}</Text>
                <Text style={[styles.td, { width: 55 }]}>{a.score_discipline ?? "-"}</Text>
                <Text style={styles.td}>{a.average_score?.toFixed(1) ?? "-"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>G. Perkembangan Calistung &amp; Berhitung</Text>
        {progressRecords.length === 0 ? (
          <Text style={styles.empty}>Belum ada data perkembangan.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 70 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 60 }]}>Kategori</Text>
              <Text style={[styles.th, { width: 110 }]}>Aspek</Text>
              <Text style={[styles.th, { width: 55 }]}>Periode</Text>
              <Text style={[styles.th, { width: 95 }]}>Level</Text>
              <Text style={[styles.th, { width: 35 }]}>Skor</Text>
              <Text style={styles.th}>Catatan</Text>
            </View>
            {progressRecords.map((p: any) => (
              <View key={p.id} style={styles.row}>
                <Text style={[styles.td, { width: 70 }]}>{p.recorded_at}</Text>
                <Text style={[styles.td, { width: 60 }]}>{p.subject_category}</Text>
                <Text style={[styles.td, { width: 110 }]}>{p.aspect_name}</Text>
                <Text style={[styles.td, { width: 55 }]}>{p.period}</Text>
                <Text style={[styles.td, { width: 95 }]}>{p.level}</Text>
                <Text style={[styles.td, { width: 35 }]}>{p.score ?? "-"}</Text>
                <Text style={styles.td}>{p.note ?? "-"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>H. Kasus Khusus</Text>
        {cases.length === 0 ? (
          <Text style={styles.empty}>Tidak ada kasus khusus.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 70 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 100 }]}>Judul</Text>
              <Text style={[styles.th, { width: 70 }]}>Kategori</Text>
              <Text style={[styles.th, { width: 65 }]}>Status</Text>
              <Text style={[styles.th, { width: 90 }]}>Pelapor</Text>
              <Text style={styles.th}>Deskripsi</Text>
            </View>
            {cases.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={[styles.td, { width: 70 }]}>{c.createdAt.split("T")[0]}</Text>
                <Text style={[styles.td, { width: 100 }]}>{c.title}</Text>
                <Text style={[styles.td, { width: 70 }]}>{c.category}</Text>
                <Text style={[styles.td, { width: 65 }]}>{c.status}</Text>
                <Text style={[styles.td, { width: 90 }]}>{c.reporterName}</Text>
                <Text style={styles.td}>{c.description ?? "-"}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}

async function buildWorkbook(data: NonNullable<Awaited<ReturnType<typeof getStudentReportData>>>) {
  const { student, stats, attendance, memorization, behaviors, adabAssessments, progressRecords, cases } = data;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SiMas - Kuttab Al-Fatih Bandung";
  workbook.created = new Date();

  const info = workbook.addWorksheet("Data Santri");
  info.columns = [
    { header: "Keterangan", key: "k", width: 24 },
    { header: "Nilai", key: "v", width: 46 },
  ];
  info.addRows([
    { k: "NIS", v: student.nis },
    { k: "Nama Lengkap", v: student.full_name },
    { k: "Jenis Kelamin", v: GENDER[student.gender] ?? student.gender },
    { k: "Tempat Lahir", v: student.birth_place },
    { k: "Tanggal Lahir", v: student.birth_date },
    { k: "Alamat", v: student.address ?? "-" },
    { k: "Kelas", v: student.class_name },
    { k: "Halaqah", v: student.halaqah_name ?? "-" },
    { k: "Tanggal Daftar", v: student.enrollment_date ?? "-" },
    { k: "Ayah", v: student.father_name ?? "-" },
    { k: "Ibu", v: student.mother_name ?? "-" },
    { k: "Wali", v: student.guardian_name ?? "-" },
    { k: "No. Telp Wali", v: student.guardian_phone ?? "-" },
    { k: "Status", v: student.status },
  ]);
  info.getRow(1).font = { bold: true, size: 14 };
  info.getRow(2).font = { bold: true, color: { argb: "FF64748B" } };

  const summary = workbook.addWorksheet("Ringkasan");
  summary.columns = [
    { header: "Indikator", key: "k", width: 30 },
    { header: "Nilai", key: "v", width: 20 },
  ];
  summary.addRows([
    { k: "Total Kehadiran", v: stats.attendance.total },
    { k: "Hadir", v: stats.attendance.hadir },
    { k: "Terlambat", v: stats.attendance.terlambat },
    { k: "Sakit", v: stats.attendance.sakit },
    { k: "Izin", v: stats.attendance.izin },
    { k: "Alpha", v: stats.attendance.alpha },
    { k: "Persentase Kehadiran (%)", v: stats.attendance.percentage },
    { k: "Total Ayat Hafalan", v: stats.memorization.totalAyahs },
    { k: "Setoran Ziyadah", v: stats.memorization.ziyadahCount },
    { k: "Setoran Murojaah", v: stats.memorization.murojaahCount },
    { k: "Perilaku Positif", v: stats.behaviors.positif },
    { k: "Perilaku Pelanggaran", v: stats.behaviors.pelanggaran },
    { k: "Pelanggaran Berat", v: stats.behaviors.berat },
    { k: "Rata-rata Adab", v: stats.adab.avgScore ?? "-" },
    { k: "Total Kasus", v: cases.length },
    {
      k: "Kasus Aktif",
      v: cases.filter((c) => c.status !== "resolved").length,
    },
  ]);

  const att = workbook.addWorksheet("Kehadiran");
  att.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Status", key: "status", width: 14 },
    { header: "Keterangan", key: "notes", width: 40 },
  ];
  att.addRows(attendance.map((a: any) => ({ date: a.date, status: a.status, notes: a.notes ?? "-" })));

  const haf = workbook.addWorksheet("Hafalan");
  haf.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Jenis", key: "type", width: 12 },
    { header: "Surah", key: "surah", width: 26 },
    { header: "Ayat Start", key: "start", width: 11 },
    { header: "Ayat End", key: "end", width: 11 },
    { header: "Juz", key: "juz", width: 7 },
    { header: "Mutu", key: "quality", width: 8 },
    { header: "Catatan", key: "note", width: 30 },
  ];
  haf.addRows(
    memorization.map((m: any) => ({
      date: m.date,
      type: m.type,
      surah: `${m.surah_name} (${m.surah_number})`,
      start: m.ayah_start,
      end: m.ayah_end,
      juz: m.juz ?? "-",
      quality: m.quality ?? "-",
      note: m.note ?? "-",
    }))
  );

  const per = workbook.addWorksheet("Perilaku");
  per.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Jenis", key: "type", width: 12 },
    { header: "Kategori", key: "category", width: 20 },
    { header: "Tingkat", key: "severity", width: 11 },
    { header: "Deskripsi", key: "description", width: 40 },
    { header: "Tindakan", key: "action", width: 40 },
  ];
  per.addRows(
    behaviors.map((b: any) => ({
      date: b.date,
      type: b.type,
      category: b.category,
      severity: b.severity ?? "-",
      description: b.description ?? "-",
      action: b.action_taken ?? "-",
    }))
  );

  const adab = workbook.addWorksheet("Adab");
  adab.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Periode", key: "period", width: 12 },
    { header: "Jujur", key: "honesty", width: 10 },
    { header: "Mandiri", key: "independence", width: 10 },
    { header: "Sosial", key: "social", width: 10 },
    { header: "Kebersihan", key: "cleanliness", width: 12 },
    { header: "Disiplin", key: "discipline", width: 10 },
    { header: "Rata-rata", key: "average", width: 11 },
  ];
  adab.addRows(
    adabAssessments.map((a: any) => ({
      date: a.date,
      period: a.period,
      honesty: a.score_honesty ?? "-",
      independence: a.score_independence ?? "-",
      social: a.score_social ?? "-",
      cleanliness: a.score_cleanliness ?? "-",
      discipline: a.score_discipline ?? "-",
      average: a.average_score?.toFixed(1) ?? "-",
    }))
  );

  const prog = workbook.addWorksheet("Perkembangan");
  prog.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Kategori", key: "category", width: 14 },
    { header: "Aspek", key: "aspect", width: 26 },
    { header: "Periode", key: "period", width: 12 },
    { header: "Level", key: "level", width: 20 },
    { header: "Skor", key: "score", width: 8 },
    { header: "Catatan", key: "note", width: 34 },
  ];
  prog.addRows(
    progressRecords.map((p: any) => ({
      date: p.recorded_at,
      category: p.subject_category,
      aspect: p.aspect_name,
      period: p.period,
      level: p.level,
      score: p.score ?? "-",
      note: p.note ?? "-",
    }))
  );

  const kas = workbook.addWorksheet("Kasus");
  kas.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Judul", key: "title", width: 28 },
    { header: "Kategori", key: "category", width: 20 },
    { header: "Status", key: "status", width: 14 },
    { header: "Pelapor", key: "reporter", width: 24 },
    { header: "Tindak Lanjut", key: "followUps", width: 12 },
    { header: "Deskripsi", key: "description", width: 44 },
  ];
  kas.addRows(
    cases.map((c) => ({
      date: c.createdAt.split("T")[0],
      title: c.title,
      category: c.category,
      status: c.status,
      reporter: c.reporterName,
      followUps: c.followUpCount,
      description: c.description ?? "-",
    }))
  );

  return workbook.xlsx.writeBuffer();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Hanya manajemen dan admin yang boleh export laporan santri
  const { error: authError } = await getSessionOrError(["manajemen", "admin"]);
  if (authError) return authError;


  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "pdf";
  const stamp = new Date().toISOString().slice(0, 10);

  const data = await getStudentReportData(id);
  if (!data) {
    return NextResponse.json({ error: "Santri tidak ditemukan" }, { status: 404 });
  }

  const slug = data.student.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  try {
    if (format === "xlsx") {
      const buffer = await buildWorkbook(data);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="rekam-jejak-${slug}-${stamp}.xlsx"`,
        },
      });
    }

    const pdf = await renderToBuffer(<StudentReportPdf data={data} />);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rekam-jejak-${slug}-${stamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating student report:", error);
    return NextResponse.json({ error: "Gagal membuat laporan" }, { status: 500 });
  }
}
