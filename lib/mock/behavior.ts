import { AdabAssessment, BehaviorLog, Severity } from "@/lib/types";

export const mockAdabAssessments: AdabAssessment[] = [
  {
    id: "adab-001",
    studentId: "student-001",
    teacherId: "guru-001",
    date: "2024-09-21",
    period: "2024/2025-ganjil",
    scoreHonesty: 4,
    scoreIndependence: 4,
    scoreSocial: 3,
    scoreCleanliness: 4,
    scoreDiscipline: 4,
    averageScore: 4,
    note: "Siswa teladan, sangat baik",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "adab-002",
    studentId: "student-002",
    teacherId: "guru-001",
    date: "2024-09-21",
    period: "2024/2025-ganjil",
    scoreHonesty: 3,
    scoreIndependence: 3,
    scoreSocial: 4,
    scoreCleanliness: 3,
    scoreDiscipline: 3,
    averageScore: 3,
    note: "Cukup baik, perlu peningkatan kedisiplinan",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "adab-003",
    studentId: "student-003",
    teacherId: "guru-001",
    date: "2024-09-21",
    period: "2024/2025-ganjil",
    scoreHonesty: 2,
    scoreIndependence: 2,
    scoreSocial: 2,
    scoreCleanliness: 2,
    scoreDiscipline: 1,
    averageScore: 2,
    note: "Memerlukan bimbingan intensif tentang disiplin dan tanggung jawab",
    createdAt: new Date("2024-09-21"),
  },
];

export const mockBehaviorLogs: BehaviorLog[] = [
  {
    id: "behav-001",
    studentId: "student-001",
    teacherId: "guru-001",
    date: "2024-09-21",
    type: "positif",
    category: "kepemimpinan",
    description:
      "Ahmad Zaki memimpin doa dengan khusyu dan penuh rasa tanggung jawab",
    actionTaken: "Diberikan pujian dan menjadi contoh untuk santri lain",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "behav-002",
    studentId: "student-002",
    teacherId: "guru-001",
    date: "2024-09-20",
    type: "positif",
    category: "gotong-royong",
    description: "Fatimah membantu teman yang kesulitan tanpa diminta",
    actionTaken: "Pujian dan contoh untuk santri lain",
    createdAt: new Date("2024-09-20"),
  },
  {
    id: "behav-003",
    studentId: "student-003",
    teacherId: "guru-001",
    date: "2024-09-18",
    type: "pelanggaran",
    category: "kedisiplinan",
    severity: "sedang",
    description: "Muhammad Ihsan tidak mengerjakan tugas murojaah 3 hari berturut-turut",
    actionTaken: "Diberikan nasihat dan pengawasan intensif",
    createdAt: new Date("2024-09-18"),
  },
  {
    id: "behav-004",
    studentId: "student-003",
    teacherId: "guru-001",
    date: "2024-09-17",
    type: "pelanggaran",
    category: "ketidakjujuran",
    severity: "ringan",
    description: "Muhammad Ihsan memalsukan tanda tangan orang tua di buku absensi",
    actionTaken: "Diberikan nasihat tentang kejujuran dan integritas",
    createdAt: new Date("2024-09-17"),
  },
  {
    id: "behav-005",
    studentId: "student-004",
    teacherId: "guru-001",
    date: "2024-09-15",
    type: "pelanggaran",
    category: "kesehatan",
    severity: "berat",
    description: "Aisyah sakit berkepanjangan, tidak masuk sekolah 2 minggu",
    actionTaken: "Koordinasi dengan wali, rencanakan pemulihan bertahap",
    createdAt: new Date("2024-09-15"),
  },
];

export const getMockAdabByStudent = (
  studentId: string,
  limit = 30
): AdabAssessment[] => {
  return mockAdabAssessments
    .filter((a) => a.studentId === studentId)
    .slice(0, limit);
};

export const getMockBehaviorByStudent = (
  studentId: string,
  limit = 30
): BehaviorLog[] => {
  return mockBehaviorLogs
    .filter((b) => b.studentId === studentId)
    .slice(0, limit);
};

export const getMockBehaviorSummary = (studentId: string) => {
  const records = mockBehaviorLogs.filter((b) => b.studentId === studentId);
  return {
    positif: records.filter((b) => b.type === "positif").length,
    pelangaranRingan: records.filter(
      (b) => b.type === "pelanggaran" && b.severity === "ringan"
    ).length,
    pelangaranSedang: records.filter(
      (b) => b.type === "pelanggaran" && b.severity === "sedang"
    ).length,
    pelangaranBerat: records.filter(
      (b) => b.type === "pelanggaran" && b.severity === "berat"
    ).length,
  };
};
