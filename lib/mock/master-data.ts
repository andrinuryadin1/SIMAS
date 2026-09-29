import { AcademicYear, Class, Halaqah, Subject } from "@/lib/types";

export const mockAcademicYears: AcademicYear[] = [
  {
    id: "ay-001",
    name: "2024/2025",
    semester: "ganjil",
    startDate: "2024-07-15",
    endDate: "2024-12-20",
    isActive: true,
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "ay-002",
    name: "2024/2025",
    semester: "genap",
    startDate: "2025-01-06",
    endDate: "2025-06-30",
    isActive: false,
    createdAt: new Date("2024-06-01"),
  },
];

export const mockClasses: Class[] = [
  {
    id: "class-001",
    name: "Umar bin Khattab",
    code: "KAF-A",
    level: "A",
    academicYearId: "ay-001",
    homeroomTeacherId: "guru-001",
    createdAt: new Date("2024-06-10"),
  },
  {
    id: "class-002",
    name: "Abu Bakar As-Siddiq",
    code: "KAF-B",
    level: "B",
    academicYearId: "ay-001",
    homeroomTeacherId: "guru-002",
    createdAt: new Date("2024-06-10"),
  },
  {
    id: "class-003",
    name: "Usman bin Affan",
    code: "KAF-C",
    level: "C",
    academicYearId: "ay-001",
    homeroomTeacherId: "guru-003",
    createdAt: new Date("2024-06-10"),
  },
];

export const mockHalaqahs: Halaqah[] = [
  {
    id: "halaqah-001",
    name: "Halaqah Abu Bakar",
    classId: "class-001",
    teacherId: "guru-001",
    createdAt: new Date("2024-06-15"),
  },
  {
    id: "halaqah-002",
    name: "Halaqah Umar",
    classId: "class-002",
    teacherId: "guru-002",
    createdAt: new Date("2024-06-15"),
  },
  {
    id: "halaqah-003",
    name: "Halaqah Ali",
    classId: "class-003",
    teacherId: "guru-003",
    createdAt: new Date("2024-06-15"),
  },
];

export const mockSubjects: Subject[] = [
  {
    id: "subject-001",
    name: "Tahfidz Qur'an",
    category: "tahfidz",
    description: "Menghafal dan murojaah Qur'an Karim",
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "subject-002",
    name: "Adab & Akhlak",
    category: "adab",
    description: "Pendidikan etika dan akhlak mulia",
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "subject-003",
    name: "Calistung",
    category: "calistung",
    description: "Calistung (Baca-Tulis-Hitung)",
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "subject-004",
    name: "Berhitung",
    category: "berhitung",
    description: "Pembelajaran numerasi dan matematika dasar",
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "subject-005",
    name: "Fiqih Ibadah",
    category: "fiqih",
    description: "Fiqih dan praktik ibadah",
    createdAt: new Date("2024-06-01"),
  },
];

export const getMockClassById = (id: string): Class | undefined => {
  return mockClasses.find((c) => c.id === id);
};

export const getMockHalaqahsByClass = (classId: string): Halaqah[] => {
  return mockHalaqahs.filter((h) => h.classId === classId);
};

export const getMockSubjectByCategory = (
  category: string
): Subject | undefined => {
  return mockSubjects.find((s) => s.category === category);
};
