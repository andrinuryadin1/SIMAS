import { Attendance, AttendanceStatus } from "@/lib/types";

/**
 * Tanggal relatif terhadap hari ini.
 *
 * Dulu semua tanggal di file ini ditulis literal (2024-09-21 dst). Akibatnya
 * setiap statistik yang memfilter "bulan ini" / "minggu ini" — avgAttendancePct
 * di dashboard, absensi guru, grafik trend — selalu 0 karena tanggal mock sudah
 * dua tahun lalu. Seed harus menghasilkan angka yang masuk akal kapan pun
 * dijalankan, jadi tanggalnya dihitung relatif terhadap sekarang.
 */
const dayOffset = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const TODAY = dayOffset(0);
const D1 = dayOffset(1);
const D2 = dayOffset(2);
const D3 = dayOffset(3);

export const mockAttendance: Attendance[] = [
  // Hari ini
  {
    id: "att-001",
    studentId: "student-001",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: TODAY,
    status: "hadir",
    note: "",
    createdAt: new Date(TODAY),
  },
  {
    id: "att-002",
    studentId: "student-002",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: TODAY,
    status: "hadir",
    note: "",
    createdAt: new Date(TODAY),
  },
  {
    id: "att-003",
    studentId: "student-003",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: TODAY,
    status: "sakit",
    note: "Sakit perut",
    createdAt: new Date(TODAY),
  },
  {
    id: "att-004",
    studentId: "student-004",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: TODAY,
    status: "hadir",
    note: "",
    createdAt: new Date(TODAY),
  },

  // Hari-hari sebelumnya
  {
    id: "att-005",
    studentId: "student-001",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: D1,
    status: "hadir",
    note: "",
    createdAt: new Date(D1),
  },
  {
    id: "att-006",
    studentId: "student-001",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: D2,
    status: "hadir",
    note: "",
    createdAt: new Date(D2),
  },
  {
    id: "att-007",
    studentId: "student-003",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: D1,
    status: "alpha",
    note: "Tanpa kabar",
    createdAt: new Date(D1),
  },
  {
    id: "att-008",
    studentId: "student-003",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: D2,
    status: "alpha",
    note: "Tanpa kabar",
    createdAt: new Date(D2),
  },
  {
    id: "att-009",
    studentId: "student-002",
    halaqahId: "level-ka-1",
    teacherId: "guru-001",
    date: D3,
    status: "terlambat",
    note: "Terlambat 15 menit",
    createdAt: new Date(D3),
  },
];

export const getMockAttendanceByStudent = (
  studentId: string,
  limit = 30
): Attendance[] => {
  return mockAttendance
    .filter((a) => a.studentId === studentId)
    .slice(0, limit);
};

export const getMockAttendanceByDate = (date: string): Attendance[] => {
  return mockAttendance.filter((a) => a.date === date);
};

export const getMockAttendanceStats = (
  studentId: string,
  startDate: string,
  endDate: string
) => {
  const records = mockAttendance.filter(
    (a) =>
      a.studentId === studentId && a.date >= startDate && a.date <= endDate
  );

  return {
    total: records.length,
    hadir: records.filter((a) => a.status === "hadir").length,
    terlambat: records.filter((a) => a.status === "terlambat").length,
    sakit: records.filter((a) => a.status === "sakit").length,
    izin: records.filter((a) => a.status === "izin").length,
    alpha: records.filter((a) => a.status === "alpha").length,
  };
};
