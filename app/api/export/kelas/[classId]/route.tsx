import { NextRequest, NextResponse } from "next/server";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import ExcelJS from "exceljs";
import { getSessionOrError } from "@/lib/api-utils";
import { getClassReportData } from "@/lib/queries";

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
  statLabel: { width: 190, fontSize: 9, fontWeight: "bold", color: "#475569" },
  statValue: { fontSize: 9, color: "#1e293b" },
  studentName: { fontSize: 10, fontWeight: "bold", marginTop: 10, marginBottom: 3 },
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

function ClassReportPdf({ data }: { data: NonNullable<Awaited<ReturnType<typeof getClassReportData>>> }) {
  const { className, students, studentSummaries, attendanceSummary, hafalanSummary, behaviorSummary, casesSummary } =
    data;

  return (
    <Document title={`Laporan Kelas ${className}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Laporan Kelas</Text>
        <Text style={styles.subHeader}>Kuttab Al-Fatih Bandung</Text>
        <Text style={styles.subHeader}>Kelas: {className}</Text>
        <Text style={styles.subHeader}>
          Dicetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </Text>

        <Text style={styles.section}>A. Ringkasan Kelas</Text>
        {[
          ["Jumlah Santri", `${students.length} orang`],
          [
            "Kehadiran (seluruh periode)",
            `${attendanceSummary.hadir}/${attendanceSummary.total} (${attendanceSummary.percentage}%)`,
          ],
          [
            "Hafalan",
            `${hafalanSummary.total} ayat — Ziyadah ${hafalanSummary.ziyadah} x, Murojaah ${hafalanSummary.murojaah} x`,
          ],
          [
            "Perilaku",
            `Positif ${behaviorSummary.positif}, Pelanggaran ${behaviorSummary.pelanggaran} (Berat ${behaviorSummary.berat})`,
          ],
          [
            "Kasus Khusus",
            `${casesSummary.total} — Open ${casesSummary.open}, In Progress ${casesSummary.inProgress}, Resolved ${casesSummary.resolved}`,
          ],
        ].map(([label, value]) => (
          <View key={label} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.section}>B. Daftar Santri</Text>
        <View style={styles.row}>
          <Text style={[styles.th, { width: 28 }]}>No</Text>
          <Text style={[styles.th, { width: 80 }]}>NIS</Text>
          <Text style={styles.th}>Nama Lengkap</Text>
          <Text style={[styles.th, { width: 90 }]}>Halaqah</Text>
          <Text style={[styles.th, { width: 55 }]}>L/P</Text>
          <Text style={[styles.th, { width: 55 }]}>Status</Text>
        </View>
        {students.map((s, i) => (
          <View key={s.id} style={styles.row}>
            <Text style={[styles.td, { width: 28 }]}>{i + 1}</Text>
            <Text style={[styles.td, { width: 80 }]}>{s.nis}</Text>
            <Text style={styles.td}>{s.full_name}</Text>
            <Text style={[styles.td, { width: 90 }]}>{s.halaqah_name ?? "-"}</Text>
            <Text style={[styles.td, { width: 55 }]}>{s.gender}</Text>
            <Text style={[styles.td, { width: 55 }]}>{s.status}</Text>
          </View>
        ))}

        <Text style={styles.section}>C. Rekap Per Santri</Text>
        {students.map((s, i) => {
          const sum = studentSummaries.find((x) => x.studentId === s.id);
          if (!sum) return null;
          return (
            <View key={s.id} wrap={false}>
              <Text style={styles.studentName}>
                {i + 1}. {s.full_name} — {s.nis}
              </Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Kehadiran</Text>
                <Text style={styles.statValue}>
                  {sum.attendanceSummary.hadir}/{sum.attendanceSummary.total} (
                  {sum.attendanceSummary.percentage}%)
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Hafalan</Text>
                <Text style={styles.statValue}>
                  {sum.hafalanSummary.total} ayat — Ziyadah {sum.hafalanSummary.ziyadah} x, Murojaah{" "}
                  {sum.hafalanSummary.murojaah} x
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Perilaku</Text>
                <Text style={styles.statValue}>
                  Positif {sum.behaviorSummary.positif}, Pelanggaran {sum.behaviorSummary.pelanggaran}, Berat{" "}
                  {sum.behaviorSummary.berat}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Kasus</Text>
                <Text style={styles.statValue}>
                  {sum.casesSummary.total} — Open {sum.casesSummary.open}, In Progress {sum.casesSummary.inProgress},
                  Resolved {sum.casesSummary.resolved}
                </Text>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

async function buildWorkbook(data: NonNullable<Awaited<ReturnType<typeof getClassReportData>>>) {
  const { className, students, studentSummaries, attendanceSummary, hafalanSummary, behaviorSummary, casesSummary } =
    data;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SiMas - Kuttab Al-Fatih Bandung";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Ringkasan Kelas");
  summary.columns = [
    { header: "Indikator", key: "k", width: 32 },
    { header: "Nilai", key: "v", width: 24 },
  ];
  summary.addRows([
    { k: "Kelas", v: className },
    { k: "Jumlah Santri", v: students.length },
    { k: "Total Kehadiran", v: attendanceSummary.total },
    { k: "Hadir / Terlambat", v: attendanceSummary.hadir },
    { k: "Persentase Kehadiran (%)", v: attendanceSummary.percentage },
    { k: "Total Ayat Hafalan", v: hafalanSummary.total },
    { k: "Setoran Ziyadah", v: hafalanSummary.ziyadah },
    { k: "Setoran Murojaah", v: hafalanSummary.murojaah },
    { k: "Perilaku Positif", v: behaviorSummary.positif },
    { k: "Perilaku Pelanggaran", v: behaviorSummary.pelanggaran },
    { k: "Pelanggaran Berat", v: behaviorSummary.berat },
    { k: "Kasus Total", v: casesSummary.total },
    { k: "Kasus Open", v: casesSummary.open },
    { k: "Kasus In Progress", v: casesSummary.inProgress },
    { k: "Kasus Resolved", v: casesSummary.resolved },
  ]);

  const roster = workbook.addWorksheet("Daftar Santri");
  roster.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "NIS", key: "nis", width: 14 },
    { header: "Nama Lengkap", key: "name", width: 30 },
    { header: "L/P", key: "gender", width: 7 },
    { header: "Kelas", key: "class", width: 22 },
    { header: "Halaqah", key: "halaqah", width: 20 },
    { header: "Tempat, Tgl Lahir", key: "birth", width: 26 },
    { header: "Wali", key: "guardian", width: 26 },
    { header: "No. Telp Wali", key: "phone", width: 16 },
    { header: "Status", key: "status", width: 10 },
  ];
  roster.addRows(
    students.map((s, i) => ({
      no: i + 1,
      nis: s.nis,
      name: s.full_name,
      gender: s.gender,
      class: s.class_name,
      halaqah: s.halaqah_name ?? "-",
      birth: `${s.birth_place}, ${s.birth_date}`,
      guardian: s.guardian_name ?? s.father_name ?? "-",
      phone: s.guardian_phone ?? "-",
      status: s.status,
    }))
  );

  const recap = workbook.addWorksheet("Rekap Santri");
  recap.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "NIS", key: "nis", width: 14 },
    { header: "Nama Lengkap", key: "name", width: 30 },
    { header: "Hadir", key: "hadir", width: 9 },
    { header: "Total Absensi", key: "total", width: 13 },
    { header: "Kehadiran (%)", key: "pct", width: 14 },
    { header: "Ayat Hafalan", key: "ayat", width: 12 },
    { header: "Ziyadah", key: "ziyadah", width: 9 },
    { header: "Murojaah", key: "murojaah", width: 10 },
    { header: "Perilaku (+)", key: "pos", width: 11 },
    { header: "Perilaku (-)", key: "neg", width: 11 },
    { header: "Kasus Aktif", key: "kasus", width: 12 },
  ];
  recap.addRows(
    students.map((s, i) => {
      const sum = studentSummaries.find((x) => x.studentId === s.id);
      return {
        no: i + 1,
        nis: s.nis,
        name: s.full_name,
        hadir: sum?.attendanceSummary.hadir ?? 0,
        total: sum?.attendanceSummary.total ?? 0,
        pct: sum?.attendanceSummary.percentage ?? 0,
        ayat: sum?.hafalanSummary.total ?? 0,
        ziyadah: sum?.hafalanSummary.ziyadah ?? 0,
        murojaah: sum?.hafalanSummary.murojaah ?? 0,
        pos: sum?.behaviorSummary.positif ?? 0,
        neg: sum?.behaviorSummary.pelanggaran ?? 0,
        kasus: (sum?.casesSummary.open ?? 0) + (sum?.casesSummary.inProgress ?? 0),
      };
    })
  );

  return workbook.xlsx.writeBuffer();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  // Hanya manajemen dan admin yang boleh export laporan kelas
  const { error: authError } = await getSessionOrError(["manajemen", "admin"]);
  if (authError) return authError;

  const { classId } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "pdf";
  const stamp = new Date().toISOString().slice(0, 10);

  const data = await getClassReportData(classId);
  if (!data) {
    return NextResponse.json(
      { error: "Kelas tidak ditemukan atau belum ada santri" },
      { status: 404 }
    );
  }

  const slug = data.className.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  try {
    if (format === "xlsx") {
      const buffer = await buildWorkbook(data);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="laporan-kelas-${slug}-${stamp}.xlsx"`,
        },
      });
    }

    const pdf = await renderToBuffer(<ClassReportPdf data={data} />);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan-kelas-${slug}-${stamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating class report:", error);
    return NextResponse.json({ error: "Gagal membuat laporan" }, { status: 500 });
  }
}
