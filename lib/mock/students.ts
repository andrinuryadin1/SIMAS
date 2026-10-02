import { Student, StudentStatus } from "@/lib/types";

export const mockStudents: Student[] = [
  // --- Kuttab Awal 1-A (kelas-ka-1-a) ---
  {
    id: "student-001",
    nis: "KAF-2024-001",
    fullName: "Ahmad Zaki Mubarak",
    gender: "L",
    birthDate: "2020-03-15",
    birthPlace: "Bandung",
    address: "Jl. Merpati No. 12, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-1-a",
    kelasName: "Kuttab Awal 1-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-1",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Mubarak Setiawan",
    motherName: "Nur Azizah",
    guardianName: "Mubarak Setiawan",
    guardianPhone: "08111111111",
    photoUrl: "/avatars/student-1.jpg",
    status: "aktif",
    notes: "Siswa berprestasi, konsentrasi baik",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    id: "student-002",
    nis: "KAF-2024-002",
    fullName: "Fatimah Az-Zahra",
    gender: "P",
    birthDate: "2020-05-22",
    birthPlace: "Bandung",
    address: "Jl. Melati No. 45, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-1-a",
    kelasName: "Kuttab Awal 1-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-1",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Ahmad Fauzi",
    motherName: "Siti Nur Fadilah",
    guardianName: "Ahmad Fauzi",
    guardianPhone: "08222222222",
    photoUrl: "/avatars/student-2.jpg",
    status: "aktif",
    notes: "Sangat aktif bertanya, perlu bimbingan fokus",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    id: "student-003",
    nis: "KAF-2024-003",
    fullName: "Muhammad Ihsan",
    gender: "L",
    birthDate: "2020-07-10",
    birthPlace: "Bandung",
    address: "Jl. Anggrek No. 67, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-1-a",
    kelasName: "Kuttab Awal 1-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-1",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Ihsan Pratama",
    motherName: "Dewi Lestari",
    guardianName: "Ihsan Pratama",
    guardianPhone: "08333333333",
    photoUrl: "/avatars/student-3.jpg",
    status: "aktif",
    notes: "Perlu perhatian khusus, sering izin",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-10"),
  },
  {
    id: "student-004",
    nis: "KAF-2024-004",
    fullName: "Aisyah Nur Hamidah",
    gender: "P",
    birthDate: "2020-09-08",
    birthPlace: "Jakarta",
    address: "Jl. Cinta No. 23, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-1-a",
    kelasName: "Kuttab Awal 1-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-1",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Hamidah Rahman",
    motherName: "Ayu Murni",
    guardianName: "Hamidah Rahman",
    guardianPhone: "08444444444",
    photoUrl: "/avatars/student-4.jpg",
    status: "aktif",
    notes: "Kesehatan riwayat sakit berkepanjangan",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-12"),
  },

  // --- Kuttab Awal 2-A (kelas-ka-2-a) ---
  {
    id: "student-005",
    nis: "KAF-2024-005",
    fullName: "Muhammad Rizki",
    gender: "L",
    birthDate: "2020-02-14",
    birthPlace: "Bandung",
    address: "Jl. Bunga No. 89, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-2-a",
    kelasName: "Kuttab Awal 2-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-2",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Rizki Hermawan",
    motherName: "Dwi Juwarni",
    guardianName: "Rizki Hermawan",
    guardianPhone: "08555555555",
    photoUrl: "/avatars/student-5.jpg",
    status: "aktif",
    notes: "Prestasi baik, perlu tantangan lebih",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-14"),
  },
  {
    id: "student-006",
    nis: "KAF-2024-006",
    fullName: "Nurul Hasanah",
    gender: "P",
    birthDate: "2020-04-19",
    birthPlace: "Bandung",
    address: "Jl. Dahlia No. 34, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-2-a",
    kelasName: "Kuttab Awal 2-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-2",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Hasanah Sukoco",
    motherName: "Risma Wati",
    guardianName: "Hasanah Sukoco",
    guardianPhone: "08666666666",
    photoUrl: "/avatars/student-6.jpg",
    status: "aktif",
    notes: "Siswa yang perlu bimbingan membaca",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-13"),
  },
  {
    id: "student-007",
    nis: "KAF-2024-007",
    fullName: "Ali Imran",
    gender: "L",
    birthDate: "2020-06-25",
    birthPlace: "Bandung",
    address: "Jl. Sakura No. 56, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-ka-2-a",
    kelasName: "Kuttab Awal 2-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-ka",
    className: "Kuttab Awal",
    halaqahId: "level-ka-2",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Imran Jatnika",
    motherName: "Tuti Aminah",
    guardianName: "Imran Jatnika",
    guardianPhone: "08777777777",
    photoUrl: "/avatars/student-7.jpg",
    status: "aktif",
    notes: "Aktif tetapi perlu disiplin",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-11"),
  },

  // --- Qonuni 1-A (kelas-qo-1-a) ---
  {
    id: "student-008",
    nis: "KAF-2024-008",
    fullName: "Zainab Ummu",
    gender: "P",
    birthDate: "2020-08-30",
    birthPlace: "Bandung",
    address: "Jl. Mawar No. 78, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-qo-1-a",
    kelasName: "Qonuni 1-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-qo",
    className: "Qonuni",
    halaqahId: "level-qo-1",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Ummu Kulsum",
    motherName: "Laela Salamah",
    guardianName: "Ummu Kulsum",
    guardianPhone: "08888888888",
    photoUrl: "/avatars/student-8.jpg",
    status: "aktif",
    notes: "Siswa terbaik di kelasnya",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    id: "student-009",
    nis: "KAF-2024-009",
    fullName: "Bilal Azmi",
    gender: "L",
    birthDate: "2020-10-05",
    birthPlace: "Bandung",
    address: "Jl. Teratai No. 90, Bandung",
    // kelas Assignment — model baru, satu-satunya yang dipakai dashboard
    kelasId: "kelas-qo-1-a",
    kelasName: "Qonuni 1-A",
    // model lama (deprecated): class_* + halaqah_*
    classId: "class-qo",
    className: "Qonuni",
    halaqahId: "level-qo-1",
    academicYearId: "ay-001",
    enrollmentDate: "2024-07-10",
    fatherName: "Azmi Rachmat",
    motherName: "Siti Nurhayati",
    guardianName: "Azmi Rachmat",
    guardianPhone: "08999999999",
    photoUrl: "/avatars/student-9.jpg",
    status: "aktif",
    notes: "Perkembangan lambat, butuh latihan intensif",
    createdAt: new Date("2024-06-20"),
    updatedAt: new Date("2024-09-10"),
  },
];

export const getMockStudentById = (id: string): Student | undefined => {
  return mockStudents.find((s) => s.id === id);
};

/** Cari student's berdasarkan kelas Assignment (model baru). */
export const getMockStudentsByKelas = (kelasId: string): Student[] => {
  return mockStudents.filter((s) => s.kelasId === kelasId);
};

/** @deprecated Gunakan getMockStudentsByKelas — `classId` kini berisi id Jenjang. */
export const getMockStudentsByClass = (classId: string): Student[] => {
  return mockStudents.filter((s) => s.classId === classId);
};

/** @deprecated `halaqahId` kini berisi id Level, bukan id halaqah. */
export const getMockStudentsByHalaqah = (halaqahId: string): Student[] => {
  return mockStudents.filter((s) => s.halaqahId === halaqahId);
};

export const getMockActiveStudents = (): Student[] => {
  return mockStudents.filter((s) => s.status === "aktif");
};
