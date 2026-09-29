import { Attendance, AttendanceStatus } from "@/lib/types";

export const mockAttendance: Attendance[] = [
  // Today's attendance
  {
    id: "att-001",
    studentId: "student-001",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-21",
    status: "hadir",
    note: "",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "att-002",
    studentId: "student-002",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-21",
    status: "hadir",
    note: "",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "att-003",
    studentId: "student-003",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-21",
    status: "sakit",
    note: "Sakit perut",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "att-004",
    studentId: "student-004",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-21",
    status: "hadir",
    note: "",
    createdAt: new Date("2024-09-21"),
  },

  // Previous days
  {
    id: "att-005",
    studentId: "student-001",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-20",
    status: "hadir",
    note: "",
    createdAt: new Date("2024-09-20"),
  },
  {
    id: "att-006",
    studentId: "student-001",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-19",
    status: "hadir",
    note: "",
    createdAt: new Date("2024-09-19"),
  },
  {
    id: "att-007",
    studentId: "student-003",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-20",
    status: "alpha",
    note: "Tanpa kabar",
    createdAt: new Date("2024-09-20"),
  },
  {
    id: "att-008",
    studentId: "student-003",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-19",
    status: "alpha",
    note: "Tanpa kabar",
    createdAt: new Date("2024-09-19"),
  },
  {
    id: "att-009",
    studentId: "student-002",
    halaqahId: "halaqah-001",
    teacherId: "guru-001",
    date: "2024-09-18",
    status: "terlambat",
    note: "Terlambat 15 menit",
    createdAt: new Date("2024-09-18"),
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
