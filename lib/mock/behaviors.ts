import { BehaviorLog } from "../types";

/**
 * CATATAN ID: `studentId` WAJIB memakai format `student-0NN` yang sama dengan
 * `lib/mock/students.ts` (student-001 … student-009). Dulu file ini memakai
 * `student-1`, `student-2`, dst, sehingga FK ke `students(id)` gagal dan tabel
 * `behaviors` berakhir kosong tanpa error yang terlihat.
 */
export const mockBehaviors: BehaviorLog[] = [
  {
    id: "beh-1",
    studentId: "student-001",
    teacherId: "guru-002",
    date: "2026-09-15",
    type: "positif",
    category: "kepemimpinan",
    description: "Ahmad Zaki menunjukkan sikap kepemimpinan saat memimpin doa sebelum belajar",
    actionTaken: "Diberikan pujian di hadapan kelas",
    createdAt: new Date("2026-09-15"),
  },
  {
    id: "beh-2",
    studentId: "student-001",
    teacherId: "guru-002",
    date: "2026-09-10",
    type: "pelanggaran",
    category: "kedisiplinan",
    severity: "ringan",
    description: "Terlambat masuk kelas 10 menit tanpa alasan",
    actionTaken: "Diberikan teguran lisan",
    createdAt: new Date("2026-09-10"),
  },
  {
    id: "beh-3",
    studentId: "student-002",
    teacherId: "guru-002",
    date: "2026-09-14",
    type: "positif",
    category: "akhlak",
    description: "Fatimah membantu teman yang kesulitan mengerjakan latihan tanpa diminta",
    actionTaken: "Dicatat sebagai perilaku baik",
    createdAt: new Date("2026-09-14"),
  },
  {
    id: "beh-4",
    studentId: "student-003",
    teacherId: "guru-002",
    date: "2026-09-12",
    type: "pelanggaran",
    category: "akademik",
    severity: "sedang",
    description: "Muhammad Ihsan tidak mengerjakan tugas murojaah selama 3 hari berturut-turut",
    actionTaken: "Orang tua dihubungi, diberikan kesempatan untuk mengulang",
    createdAt: new Date("2026-09-12"),
  },
  {
    id: "beh-5",
    studentId: "student-003",
    teacherId: "guru-002",
    date: "2026-09-08",
    type: "pelanggaran",
    category: "kedisiplinan",
    severity: "berat",
    description: "Muhammad Ihsan tidak hadir selama 5 hari tanpa kabar",
    actionTaken: "Manajemen dan orang tua segera dikontak untuk follow-up",
    createdAt: new Date("2026-09-08"),
  },
  {
    id: "beh-6",
    studentId: "student-004",
    teacherId: "guru-003",
    date: "2026-09-17",
    type: "positif",
    category: "akhlak",
    description: "Aisyah Nur menunjukkan adab baik kepada guru dan teman sekelas",
    actionTaken: "Menjadi teladan bagi siswa lain",
    createdAt: new Date("2026-09-17"),
  },
];

export const getBehaviorByStudent = (studentId: string) =>
  mockBehaviors.filter(b => b.studentId === studentId);

export const getViolationsByStudent = (studentId: string) =>
  mockBehaviors.filter(b => b.studentId === studentId && b.type === "pelanggaran");

export const getPositiveByStudent = (studentId: string) =>
  mockBehaviors.filter(b => b.studentId === studentId && b.type === "positif");

export const getHeavyViolations = () =>
  mockBehaviors.filter(b => b.type === "pelanggaran" && b.severity === "berat");
