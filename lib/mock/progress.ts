import { ProgressRecord, ProgressLevel } from "@/lib/types";

export const mockProgressRecords: ProgressRecord[] = [
  {
    id: "prog-001",
    studentId: "student-001",
    teacherId: "guru-001",
    subjectCategory: "berhitung",
    aspectName: "penjumlahan",
    period: "2024/2025-ganjil",
    level: "mahir",
    score: 95,
    note: "Penguasaan sempurna, bisa mengajar teman",
    recordedAt: new Date("2024-09-21"),
  },
  {
    id: "prog-002",
    studentId: "student-001",
    teacherId: "guru-001",
    subjectCategory: "berhitung",
    aspectName: "pengurangan",
    period: "2024/2025-ganjil",
    level: "berkembang",
    score: 85,
    note: "Sudah lancar, hanya perlu latihan lebih",
    recordedAt: new Date("2024-09-21"),
  },
  {
    id: "prog-003",
    studentId: "student-001",
    teacherId: "guru-001",
    subjectCategory: "calistung",
    aspectName: "membaca-lancar",
    period: "2024/2025-ganjil",
    level: "mahir",
    score: 98,
    note: "Pembacaan sempurna dan lancar",
    recordedAt: new Date("2024-09-21"),
  },
  {
    id: "prog-004",
    studentId: "student-001",
    teacherId: "guru-001",
    subjectCategory: "calistung",
    aspectName: "menulis",
    period: "2024/2025-ganjil",
    level: "berkembang",
    score: 80,
    note: "Tulisan rapi, perlu latihan pressure/speed",
    recordedAt: new Date("2024-09-21"),
  },
  {
    id: "prog-005",
    studentId: "student-003",
    teacherId: "guru-001",
    subjectCategory: "berhitung",
    aspectName: "mengenal-angka",
    period: "2024/2025-ganjil",
    level: "sedang_berkembang",
    score: 60,
    note: "Masih perlu penguatan dasar",
    recordedAt: new Date("2024-09-21"),
  },
  {
    id: "prog-006",
    studentId: "student-003",
    teacherId: "guru-001",
    subjectCategory: "calistung",
    aspectName: "membaca-suku-kata",
    period: "2024/2025-ganjil",
    level: "sedang_berkembang",
    score: 55,
    note: "Masih banyak kesalahan, butuh bimbingan intensif",
    recordedAt: new Date("2024-09-21"),
  },
  {
    id: "prog-007",
    studentId: "student-002",
    teacherId: "guru-001",
    subjectCategory: "berhitung",
    aspectName: "penjumlahan",
    period: "2024/2025-ganjil",
    level: "berkembang",
    score: 75,
    note: "Cukup menguasai, perlu latihan lebih",
    recordedAt: new Date("2024-09-21"),
  },
];

export const getMockProgressByStudent = (
  studentId: string,
  limit = 30
): ProgressRecord[] => {
  return mockProgressRecords
    .filter((p) => p.studentId === studentId)
    .slice(0, limit);
};

export const getMockProgressByCategory = (
  studentId: string,
  category: "berhitung" | "calistung"
): ProgressRecord[] => {
  return mockProgressRecords.filter(
    (p) => p.studentId === studentId && p.subjectCategory === category
  );
};
