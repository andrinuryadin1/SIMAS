// ===== USER & AUTH =====
export type Role = "admin" | "guru" | "manajemen";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== MASTER DATA =====
export interface AcademicYear {
  id: string;
  name: string; // "2024/2025"
  semester: "ganjil" | "genap";
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Class {
  id: string;
  name: string; // "Umar bin Khattab"
  code: string; // "KAF-A"
  level: string; // "A", "B", "C"
  academicYearId: string;
  homeroomTeacherId?: string;
  createdAt: Date;
}

export interface Halaqah {
  id: string;
  name: string; // "Halaqah Abu Bakar"
  classId: string;
  teacherId: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  category: "tahfidz" | "adab" | "calistung" | "berhitung" | "fiqih";
  description?: string;
  createdAt: Date;
}

// ===== STUDENTS =====
export type Gender = "L" | "P";
export type StudentStatus = "aktif" | "lulus" | "pindah" | "berhenti";

export interface Student {
  id: string;
  nis: string; // "KAF-2024-001"
  fullName: string;
  gender: Gender;
  birthDate: string;
  birthPlace?: string;
  address?: string;
  className?: string;
  classId?: string;
  halaqahId?: string;
  /**
   * Kelas Assignment yang sebenarnya (Jenjang → Level → Kelas).
   * Inilah kolom yang dipakai seluruh statistik dashboard. `classId`/
   * `className`/`halaqahId` berasal dari model lama dan deprecated —
   * lihat lib/mock/students.ts untuk pemetaannya.
   */
  kelasId?: string;
  kelasName?: string;
  academicYearId?: string;
  enrollmentDate: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  photoUrl?: string;
  status: StudentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== ATTENDANCE =====
export type AttendanceStatus = "hadir" | "terlambat" | "sakit" | "izin" | "alpha";

export interface Attendance {
  id: string;
  studentId: string;
  halaqahId: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  createdAt: Date;
}

// ===== QURAN MEMORIZATION =====
export type MemorizationType = "ziyadah" | "murojaah";
export type Quality = "A" | "B" | "C" | "D";

export interface QuranMemorization {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  type: MemorizationType;
  surahName: string;
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  juz?: number;
  quality: Quality;
  note?: string;
  createdAt: Date;
}

// ===== ADAB & BEHAVIOR =====
export interface AdabAssessment {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  period: string; // "2024/2025-ganjil" atau "pekan-12"
  scoreHonesty: number; // 1-4
  scoreIndependence: number;
  scoreSocial: number;
  scoreCleanliness: number;
  scoreDiscipline: number;
  averageScore: number;
  note?: string;
  createdAt: Date;
}

export type BehaviorType = "positif" | "pelanggaran";
export type Severity = "ringan" | "sedang" | "berat";

export interface BehaviorLog {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  type: BehaviorType;
  category: string;
  severity?: Severity;
  description: string;
  actionTaken?: string;
  createdAt: Date;
}

// ===== PROGRESS =====
export type ProgressLevel = "belum" | "sedang_berkembang" | "berkembang" | "mahir";

export interface ProgressRecord {
  id: string;
  studentId: string;
  teacherId: string;
  subjectCategory: "berhitung" | "calistung";
  aspectName: string;
  period: string;
  level: ProgressLevel;
  score?: number;
  note?: string;
  recordedAt: Date;
}

// ===== TEACHING JOURNAL =====
export interface TeachingJournal {
  id: string;
  teacherId: string;
  halaqahId: string;
  subjectId?: string;
  date: string;
  topic: string;
  method?: string;
  summary: string;
  obstacles?: string;
  reflection?: string;
  createdAt: Date;
}

// ===== SPECIAL CASES =====
export type CaseStatus = "open" | "in_progress" | "resolved";

export interface FollowUpNote {
  by: string;
  at: string;
  note: string;
}

export interface SpecialCase {
  id: string;
  studentId: string;
  reporterId: string;
  title: string;
  description: string;
  category: "kesehatan" | "keluarga" | "akademik" | "perilaku";
  status: CaseStatus;
  followUpNotes: FollowUpNote[];
  resolvedAt?: Date;
  createdAt: Date;
}

// ===== NOTIFICATIONS =====
export type NotificationType = 
  | "reminder_weekly" 
  | "attendance_alpha" 
  | "case_new" 
  | "behavior_heavy" 
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

// ===== REMINDER SETTINGS =====
export interface ReminderSetting {
  id: string;
  dayOfWeek: number; // 0=Sunday..6=Saturday
  timeOfDay: string; // "14:00"
  timezone: string;
  isActive: boolean;
  messageTemplate: string;
  updatedBy?: string;
  updatedAt: Date;
}
