import { SpecialCase, CaseStatus, FollowUpNote } from "@/lib/types";

export const mockSpecialCases: SpecialCase[] = [
  {
    id: "case-001",
    studentId: "student-003",
    reporterId: "guru-001",
    title: "Ketidakhadiran Berulang",
    description:
      "Muhammad Ihsan tidak masuk sekolah 3 hari berturut-turut tanpa pemberitahuan. Ketika ditanya, orangtua mengatakan ada masalah keluarga.",
    category: "keluarga",
    status: "in_progress",
    followUpNotes: [
      {
        by: "Guru Rizki Firmansyah",
        at: "2024-09-18",
        note: "Menghubungi orangtua untuk mengetahui kondisi. Disarankan untuk berkomunikasi rutin.",
      },
      {
        by: "Manajemen Hendra Wijaya",
        at: "2024-09-20",
        note: "Follow up ke orangtua. Akan diberi program khusus untuk catch-up.",
      },
    ],
    createdAt: new Date("2024-09-18"),
  },
  {
    id: "case-002",
    studentId: "student-004",
    reporterId: "guru-001",
    title: "Sakit Berkepanjangan",
    description:
      "Aisyah Nur Hamidah telah tidak masuk sekolah selama 2 minggu karena sakit demam yang berkepanjangan. Perlu monitoring kesehatan dan program pemulihan.",
    category: "kesehatan",
    status: "in_progress",
    followUpNotes: [
      {
        by: "Guru Rizki Firmansyah",
        at: "2024-09-15",
        note: "Siswa sakit demam, orangtua sudah diberi tahu untuk istirahat cukup.",
      },
      {
        by: "Manajemen Ratna Kusuma",
        at: "2024-09-19",
        note: "Koordinasi dengan keluarga. Akan ada program home learning sambil pemulihan.",
      },
    ],
    createdAt: new Date("2024-09-15"),
  },
  {
    id: "case-003",
    studentId: "student-001",
    reporterId: "guru-001",
    title: "Kecenderungan Kepemimpinan Tinggi",
    description:
      "Ahmad Zaki Mubarak menunjukkan kemampuan kepemimpinan yang luar biasa. Sering dipilih teman untuk memimpin doa dan kegiatan kelompok. Perlu difasilitasi pengembangan lebih lanjut.",
    category: "akademik",
    status: "open",
    followUpNotes: [],
    createdAt: new Date("2024-09-10"),
  },
  {
    id: "case-004",
    studentId: "student-002",
    reporterId: "guru-001",
    title: "Kesulitan Konsentrasi",
    description:
      "Fatimah Az-Zahra sering berbicara di luar konteks pelajaran dan sulit fokus. Perlu strategi khusus untuk membantu konsentrasinya di kelas.",
    category: "akademik",
    status: "in_progress",
    followUpNotes: [
      {
        by: "Guru Rizki Firmansyah",
        at: "2024-09-17",
        note: "Mengobservasi perilaku di kelas. Disarankan untuk duduk di tempat yang lebih terkontrol.",
      },
    ],
    createdAt: new Date("2024-09-14"),
  },
];

export const getMockCaseById = (id: string): SpecialCase | undefined => {
  return mockSpecialCases.find((c) => c.id === id);
};

export const getMockCasesByStudent = (studentId: string): SpecialCase[] => {
  return mockSpecialCases.filter((c) => c.studentId === studentId);
};

export const getMockCasesByStatus = (status: CaseStatus): SpecialCase[] => {
  return mockSpecialCases.filter((c) => c.status === status);
};

export const getMockOpenCases = (): SpecialCase[] => {
  return mockSpecialCases.filter(
    (c) => c.status === "open" || c.status === "in_progress"
  );
};
