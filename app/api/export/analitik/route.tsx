import { NextRequest, NextResponse } from "next/server";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import ExcelJS from "exceljs";
import { getSessionOrError } from "@/lib/api-utils";
import { getStats } from "@/lib/queries";
import type { UserRole } from "@/components/auth-context";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 9 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#064e3b" },
  subHeader: { fontSize: 11, color: "#334155" },
  section: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 6, color: "#0f172a" },
  statRow: { flexDirection: "row", marginBottom: 3 },
  statLabel: { width: 200, fontSize: 9, fontWeight: "bold", color: "#475569" },
  statValue: { fontSize: 9, color: "#1e293b" },
  th: { fontSize: 8, fontWeight: "bold", backgroundColor: "#f1f5f9", padding: 4, borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
  td: { fontSize: 8, padding: 4 },
  row: { flexDirection: "row" },
});

function AnalitikPdf({ stats }: { stats: Awaited<ReturnType<typeof getStats>> }) {
  const { overview, charts, details, guruStats } = stats;

  return (
    <Document title="Laporan Analitik SiMas">
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Laporan Data Analitik</Text>
        <Text style={styles.subHeader}>Kuttab Al-Fatih Bandung</Text>
        <Text style={styles.subHeader}>
          Periode: Mingguan & Bulanan (otomatis dari data terbaru)
        </Text>
        <Text style={styles.subHeader}>
          Dicetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </Text>

        <Text style={styles.section}>A. Ikhtisar (Overview)</Text>
        {[
          ["Total Santri Aktif", `${overview.totalStudents} orang`],
          ["Kehadiran Minggu Ini", `${overview.attendancePct}%`],
          ["Kasus Aktif", `${overview.activeCases} kasus`],
          ["Total Guru Aktif", `${overview.totalGuru} orang`],
          ["Hafalan Bulan Ini", `${overview.hafalanThisMonth} setoran`],
          ["Perilaku Bulan Ini", `${overview.behaviorsThisMonth} catatan`],
        ].map(([label, value]) => (
          <View key={label} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}

        {guruStats && (
          <>
            <Text style={styles.section}>B. Statistik Khusus Guru (Anda)</Text>
            {[
              ["Santri Bimbingan", `${guruStats.myStudents} orang`],
              ["Kehadiran Mingguan", `${guruStats.myAttendancePct}%`],
              ["Kasus Aktif Bimbingan", `${guruStats.myActiveCases} kasus`],
            ].map(([label, value]) => (
              <View key={label} style={styles.statRow}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>C. Detail Hafalan Bulan Ini</Text>
        {[
          ["Total Ayat", `${details.hafalan.total} ayat`],
          ["Ziyadah", `${details.hafalan.ziyadah} setoran`],
          ["Murojaah", `${details.hafalan.murojaah} setoran`],
        ].map(([label, value]) => (
          <View key={label} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.section}>D. Detail Perilaku Bulan Ini</Text>
        {[
          ["Total Catatan", `${details.behaviors.total}`],
          ["Positif", `${details.behaviors.positif}`],
          ["Pelanggaran", `${details.behaviors.pelanggaran}`],
          ["Berat", `${details.behaviors.berat}`],
        ].map(([label, value]) => (
          <View key={label} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.section}>E. Distribusi Santri per Kelas</Text>
        {charts.studentsByClass.length === 0 ? (
          <Text style={{ fontSize: 9, fontStyle: "italic", color: "#64748b" }}>Belum ada data.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 180 }]}>Kelas</Text>
              <Text style={[styles.th, { width: 60 }]}>Jumlah</Text>
            </View>
            {charts.studentsByClass.map((c) => (
              <View key={c.label} style={styles.row}>
                <Text style={[styles.td, { width: 180 }]}>{c.label}</Text>
                <Text style={[styles.td, { width: 60 }]}>{c.value}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>F. Tren Kehadiran (7 Hari Terakhir)</Text>
        {charts.attendanceTrend.length === 0 ? (
          <Text style={{ fontSize: 9, fontStyle: "italic", color: "#64748b" }}>Belum ada data.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 80 }]}>Tanggal</Text>
              <Text style={[styles.th, { width: 60 }]}>Total</Text>
              <Text style={[styles.th, { width: 60 }]}>Hadir</Text>
              <Text style={[styles.th, { width: 60 }]}>%</Text>
            </View>
            {charts.attendanceTrend.map((d) => (
              <View key={d.date} style={styles.row}>
                <Text style={[styles.td, { width: 80 }]}>{d.date}</Text>
                <Text style={[styles.td, { width: 60 }]}>{d.total}</Text>
                <Text style={[styles.td, { width: 60 }]}>{d.hadir}</Text>
                <Text style={[styles.td, { width: 60 }]}>{d.percentage}%</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>G. Hafalan per Kelas (Bulan Ini)</Text>
        {charts.hafalanByClass.length === 0 ? (
          <Text style={{ fontSize: 9, fontStyle: "italic", color: "#64748b" }}>Belum ada data.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 180 }]}>Kelas</Text>
              <Text style={[styles.th, { width: 60 }]}>Jumlah Setoran</Text>
            </View>
            {charts.hafalanByClass.map((c) => (
              <View key={c.label} style={styles.row}>
                <Text style={[styles.td, { width: 180 }]}>{c.label}</Text>
                <Text style={[styles.td, { width: 60 }]}>{c.value}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>H. Perilaku per Jenis (Bulan Ini)</Text>
        {charts.behaviorTrend.length === 0 ? (
          <Text style={{ fontSize: 9, fontStyle: "italic", color: "#64748b" }}>Belum ada data.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 180 }]}>Jenis</Text>
              <Text style={[styles.th, { width: 60 }]}>Jumlah</Text>
            </View>
            {charts.behaviorTrend.map((b) => (
              <View key={b.label} style={styles.row}>
                <Text style={[styles.td, { width: 180 }]}>{b.label}</Text>
                <Text style={[styles.td, { width: 60 }]}>{b.value}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>I. Kasus per Status</Text>
        {charts.casesByStatus.length === 0 ? (
          <Text style={{ fontSize: 9, fontStyle: "italic", color: "#64748b" }}>Belum ada data.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={[styles.th, { width: 180 }]}>Status</Text>
              <Text style={[styles.th, { width: 60 }]}>Jumlah</Text>
            </View>
            {charts.casesByStatus.map((c) => (
              <View key={c.label} style={styles.row}>
                <Text style={[styles.td, { width: 180 }]}>{c.label}</Text>
                <Text style={[styles.td, { width: 60 }]}>{c.value}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}

async function buildWorkbook(stats: Awaited<ReturnType<typeof getStats>>) {
  const { overview, charts, details, guruStats } = stats;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SiMas - Kuttab Al-Fatih Bandung";
  workbook.created = new Date();

  const ov = workbook.addWorksheet("Overview");
  ov.columns = [{ header: "Indikator", key: "k", width: 34 }, { header: "Nilai", key: "v", width: 18 }];
  ov.addRows([
    { k: "Total Santri Aktif", v: overview.totalStudents },
    { k: "Kehadiran Minggu Ini (%)", v: overview.attendancePct },
    { k: "Kasus Aktif", v: overview.activeCases },
    { k: "Total Guru Aktif", v: overview.totalGuru },
    { k: "Hafalan Bulan Ini (setoran)", v: overview.hafalanThisMonth },
    { k: "Perilaku Bulan Ini (catatan)", v: overview.behaviorsThisMonth },
  ]);

  if (guruStats) {
    const gs = workbook.addWorksheet("Guru Stats");
    gs.columns = [{ header: "Indikator", key: "k", width: 30 }, { header: "Nilai", key: "v", width: 18 }];
    gs.addRows([
      { k: "Santri Bimbingan", v: guruStats.myStudents },
      { k: "Kehadiran Mingguan (%)", v: guruStats.myAttendancePct },
      { k: "Kasus Aktif Bimbingan", v: guruStats.myActiveCases },
    ]);
  }

  const haf = workbook.addWorksheet("Hafalan Detail");
  haf.columns = [
    { header: "Indikator", key: "k", width: 24 },
    { header: "Nilai", key: "v", width: 14 },
  ];
  haf.addRows([
    { k: "Total Ayat", v: details.hafalan.total },
    { k: "Ziyadah", v: details.hafalan.ziyadah },
    { k: "Murojaah", v: details.hafalan.murojaah },
  ]);

  const per = workbook.addWorksheet("Perilaku Detail");
  per.columns = [
    { header: "Indikator", key: "k", width: 24 },
    { header: "Nilai", key: "v", width: 14 },
  ];
  per.addRows([
    { k: "Total", v: details.behaviors.total },
    { k: "Positif", v: details.behaviors.positif },
    { k: "Pelanggaran", v: details.behaviors.pelanggaran },
    { k: "Berat", v: details.behaviors.berat },
  ]);

  const cls = workbook.addWorksheet("Santri per Kelas");
  cls.columns = [{ header: "Kelas", key: "label", width: 30 }, { header: "Jumlah", key: "value", width: 12 }];
  cls.addRows(charts.studentsByClass.map((c) => ({ label: c.label, value: c.value })));

  const att = workbook.addWorksheet("Tren Kehadiran");
  att.columns = [
    { header: "Tanggal", key: "date", width: 14 },
    { header: "Total", key: "total", width: 10 },
    { header: "Hadir", key: "hadir", width: 10 },
    { header: "Persentase (%)", key: "pct", width: 16 },
  ];
  att.addRows(
    charts.attendanceTrend.map((d) => ({
      date: d.date,
      total: d.total,
      hadir: d.hadir,
      pct: d.percentage,
    }))
  );

  const hfc = workbook.addWorksheet("Hafalan per Kelas");
  hfc.columns = [{ header: "Kelas", key: "label", width: 30 }, { header: "Jumlah", key: "value", width: 12 }];
  hfc.addRows(charts.hafalanByClass.map((c) => ({ label: c.label, value: c.value })));

  const bhv = workbook.addWorksheet("Perilaku per Jenis");
  bhv.columns = [{ header: "Jenis", key: "label", width: 20 }, { header: "Jumlah", key: "value", width: 12 }];
  bhv.addRows(charts.behaviorTrend.map((b) => ({ label: b.label, value: b.value })));

  const cst = workbook.addWorksheet("Kasus per Status");
  cst.columns = [{ header: "Status", key: "label", width: 20 }, { header: "Jumlah", key: "value", width: 12 }];
  cst.addRows(charts.casesByStatus.map((c) => ({ label: c.label, value: c.value })));

  return workbook.xlsx.writeBuffer();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period?: string }> }
) {
  // Manajemen dan admin; guru bisa tapi data difilter (ditangani getStats)
  const { session, error: authError } = await getSessionOrError(["manajemen", "admin", "guru"]);
  if (authError) return authError;

  const format = request.nextUrl.searchParams.get("format") ?? "pdf";
  const period = request.nextUrl.searchParams.get("period") ?? "";
  const stamp = new Date().toISOString().slice(0, 10);
  const role = (session!.user as any)?.role as UserRole | undefined;
  const userId = (session!.user as any)?.id as string | undefined;

  const stats = await getStats(userId, role);

  try {
    if (format === "xlsx") {
      const buffer = await buildWorkbook(stats);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="laporan-analitik-${stamp}.xlsx"`,
        },
      });
    }

    const pdf = await renderToBuffer(<AnalitikPdf stats={stats} />);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan-analitik-${stamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating analitik report:", error);
    return NextResponse.json({ error: "Gagal membuat laporan analitik" }, { status: 500 });
  }
}