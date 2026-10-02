import { QuranMemorization, MemorizationType, Quality } from "@/lib/types";

/**
 * Tanggal relatif terhadap hari ini.
 *
 * Sama seperti mock/attendance.ts: tanggal literal 2024-09 membuat
 * `totalHafalanJuz` (filter "bulan ini") selalu 0. Lihat catatan di sana.
 */
const dayOffset = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const TODAY = dayOffset(0);
const D1 = dayOffset(1);

export const mockQuranMemorization: QuranMemorization[] = [
  {
    id: "mem-001",
    studentId: "student-001",
    teacherId: "guru-001",
    date: TODAY,
    type: "ziyadah",
    surahName: "An-Naba",
    surahNumber: 78,
    ayahStart: 1,
    ayahEnd: 15,
    juz: 30,
    quality: "A",
    note: "Bacaan lancar, tajwid baik",
    createdAt: new Date(TODAY),
  },
  {
    id: "mem-002",
    studentId: "student-001",
    teacherId: "guru-001",
    date: D1,
    type: "murojaah",
    surahName: "An-Naba",
    surahNumber: 78,
    ayahStart: 1,
    ayahEnd: 10,
    juz: 30,
    quality: "A",
    note: "Sempurna",
    createdAt: new Date(D1),
  },
  {
    id: "mem-003",
    studentId: "student-002",
    teacherId: "guru-001",
    date: TODAY,
    type: "ziyadah",
    surahName: "An-Naba",
    surahNumber: 78,
    ayahStart: 16,
    ayahEnd: 30,
    juz: 30,
    quality: "B",
    note: "Bacaan lancar, beberapa kesalahan tajwid",
    createdAt: new Date(TODAY),
  },
  {
    id: "mem-004",
    studentId: "student-003",
    teacherId: "guru-001",
    date: TODAY,
    type: "ziyadah",
    surahName: "An-Naba",
    surahNumber: 78,
    ayahStart: 1,
    ayahEnd: 5,
    juz: 30,
    quality: "C",
    note: "Masih tersendat, perlu latihan lebih",
    createdAt: new Date(TODAY),
  },
  {
    id: "mem-005",
    studentId: "student-004",
    teacherId: "guru-001",
    date: D1,
    type: "ziyadah",
    surahName: "An-Naba",
    surahNumber: 78,
    ayahStart: 31,
    ayahEnd: 40,
    juz: 30,
    quality: "A",
    note: "Sempurna, tajwid rapi",
    createdAt: new Date(D1),
  },
  {
    id: "mem-006",
    studentId: "student-005",
    teacherId: "guru-002",
    date: TODAY,
    type: "ziyadah",
    surahName: "An-Nahu",
    surahNumber: 16,
    ayahStart: 1,
    ayahEnd: 10,
    juz: 14,
    quality: "A",
    note: "Penguasaan baik, tajwid benar",
    createdAt: new Date(TODAY),
  },
];

export const getMockMemorizationByStudent = (
  studentId: string,
  limit = 30
): QuranMemorization[] => {
  return mockQuranMemorization
    .filter((m) => m.studentId === studentId)
    .slice(0, limit);
};

export const getMockMemorizationStats = (
  studentId: string,
  startDate: string,
  endDate: string
) => {
  const records = mockQuranMemorization.filter(
    (m) =>
      m.studentId === studentId && m.date >= startDate && m.date <= endDate
  );

  const qualityRecords = records.filter(
    (m) => m.quality === "A" || m.quality === "B"
  );

  const totalJuz = qualityRecords.reduce((sum, m) => {
    const ayahCount = m.ayahEnd - m.ayahStart + 1;
    return sum + ayahCount / 30; // Simple calculation
  }, 0);

  return {
    totalSessions: records.length,
    qualityA: records.filter((m) => m.quality === "A").length,
    qualityB: records.filter((m) => m.quality === "B").length,
    qualityC: records.filter((m) => m.quality === "C").length,
    qualityD: records.filter((m) => m.quality === "D").length,
    estimatedJuz: Math.round(totalJuz * 100) / 100,
  };
};
