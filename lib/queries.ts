import "server-only";
import db from "@/lib/db";
import type { UserRole } from "@/components/auth-context";

/* ------------------------------------------------------------ helpers */

const fmt = (d: Date) => d.toISOString().split("T")[0];

/** Shortcut for COUNT queries that return a single number. */
async function count(sql: string, ...params: unknown[]): Promise<number> {
  const row = await db.prepare(sql).get<{ c: number }>(...params);
  return row?.c ?? 0;
}

/* ------------------------------------------------------------ students */

export async function getStudents(filters?: {
  classId?: string;
  halaqahId?: string;
  kelasId?: string;
}): Promise<StudentRow[]> {
  let query =
    "SELECT id, nis, full_name, gender, birth_date, birth_place, address, class_id, class_name, halaqah_id, halaqah_name, kelas_id, kelas_name, academic_year_id, enrollment_date, father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes FROM students";
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.classId) {
    conditions.push("class_id = ?");
    params.push(filters.classId);
  }
  if (filters?.halaqahId) {
    conditions.push("halaqah_id = ?");
    params.push(filters.halaqahId);
  }
  if (filters?.kelasId) {
    conditions.push("kelas_id = ?");
    params.push(filters.kelasId);
  }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY full_name";
  return db.prepare(query).all<StudentRow>(...params);
}

export async function getStudentById(
  id: string
): Promise<StudentRow | undefined> {
  return db
    .prepare(
      "SELECT id, nis, full_name, gender, birth_date, birth_place, address, class_id, class_name, halaqah_id, halaqah_name, kelas_id, kelas_name, academic_year_id, enrollment_date, father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes FROM students WHERE id = ?"
    )
    .get<StudentRow>(id);
}

export async function getStudentsByHalaqah(
  halaqahId: string
): Promise<StudentRow[]> {
  return db
    .prepare(
      "SELECT id, nis, full_name, gender, birth_date, birth_place, address, class_id, class_name, halaqah_id, halaqah_name, kelas_id, kelas_name, academic_year_id, enrollment_date, father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes FROM students WHERE halaqah_id = ? AND status = 'aktif' ORDER BY full_name"
    )
    .all<StudentRow>(halaqahId);
}

/* ------------------------------------------------------------ master data */

export interface ClassOption {
  id: string;
  name: string;
}

export async function getClassOptions(): Promise<ClassOption[]> {
  return db.prepare("SELECT id, name FROM classes ORDER BY name").all<ClassOption>();
}

export interface HalaqahOption {
  id: string;
  name: string;
  pembina: string | null;
}

export interface KelasOption {
  id: string;
  name: string;
  jenjang_name: string;
  level_name: string;
  pembina: string | null;
}

export async function getKelasOptions(): Promise<KelasOption[]> {
  return db
    .prepare("SELECT id, name, jenjang_name, level_name, pembina FROM kelas ORDER BY name")
    .all<KelasOption>();
}

export async function getHalaqahOptions(): Promise<HalaqahOption[]> {
  return db
    .prepare("SELECT id, name, pembina FROM halaqahs ORDER BY name")
    .all<HalaqahOption>();
}

export interface SubjectOption {
  id: string;
  name: string;
}

export async function getSubjectOptions(): Promise<SubjectOption[]> {
  return db.prepare("SELECT id, name FROM subjects ORDER BY name").all<SubjectOption>();
}

export interface AcademicYearOption {
  id: string;
  name: string;
  semester: string;
  isActive: boolean;
}

export async function getAcademicYearOptions(): Promise<AcademicYearOption[]> {
  const rows = await db
    .prepare("SELECT id, name, semester, is_active FROM academic_years ORDER BY name DESC")
    .all<any>();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    semester: r.semester,
    isActive: !!r.is_active,
  }));
}

/* ------------------------------------------------------------------ users */

export interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  journalCount: number;
  halaqahId: string | null;
  halaqahName: string | null;
  studentCount: number;
}

export async function getUsers(filters?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<UserRow[]> {
  let query = `
    SELECT
      u.id, u.email, u.full_name, u.role, u.phone, u.avatar_url, u.status,
      u.created_at, u.updated_at,
      h.id AS halaqah_id, h.name AS halaqah_name,
      (SELECT COUNT(*) FROM teaching_journals tj WHERE tj.user_id = u.id) AS journal_count,
      (SELECT COUNT(*) FROM students s WHERE s.halaqah_id = h.id) AS student_count
    FROM users u
    LEFT JOIN halaqahs h ON h.pembina = u.full_name OR h.id = u.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.role && filters.role !== "all") {
    conditions.push("u.role = ?");
    params.push(filters.role);
  }
  if (filters?.status && filters.status !== "all") {
    conditions.push("u.status = ?");
    params.push(filters.status);
  }
  if (filters?.search) {
    conditions.push("(u.full_name LIKE ? OR u.email LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY u.role, u.full_name";

  const rows = await db.prepare(query).all<any>(...params);
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    phone: r.phone,
    avatarUrl: r.avatar_url,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    journalCount: r.journal_count ?? 0,
    halaqahId: r.halaqah_id ?? null,
    halaqahName: r.halaqah_name ?? null,
    studentCount: r.student_count ?? 0,
  })) as UserRow[];
}

export async function getGuruHalaqahId(
  guruId: string
): Promise<string | null> {
  const byPembina = await db
    .prepare(
      "SELECT h.id FROM halaqahs h JOIN users u ON h.pembina = u.full_name WHERE u.id = ? LIMIT 1"
    )
    .get<{ id: string }>(guruId);
  if (byPembina) return byPembina.id;

  const first = await db
    .prepare(
      "SELECT h.id FROM halaqahs h JOIN students s ON s.halaqah_id = h.id JOIN attendance a ON a.halaqah_id = h.id AND a.user_id = ? LIMIT 1"
    )
    .get<{ id: string }>(guruId);
  return first?.id ?? null;
}

/* --------------------------------------------------------- notifications */

export interface NotificationRow {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
  userName: string;
}

export async function getNotifications(options?: {
  userId?: string;
  scope?: "mine" | "all";
  isRead?: boolean;
}): Promise<{ notifications: NotificationRow[]; unreadCount: number }> {
  let query = `
    SELECT n.id, n.user_id, n.type, n.title, n.message, n.link_url, n.is_read, n.created_at,
           u.full_name AS user_name
    FROM notifications n
    JOIN users u ON n.user_id = u.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options?.scope !== "all" && options?.userId) {
    conditions.push("n.user_id = ?");
    params.push(options.userId);
  }
  if (typeof options?.isRead === "boolean") {
    conditions.push("n.is_read = ?");
    params.push(options.isRead ? 1 : 0);
  }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY n.is_read ASC, n.created_at DESC";

  const rows = await db.prepare(query).all<any>(...params);
  const notifications = rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    type: r.type,
    title: r.title,
    message: r.message,
    linkUrl: r.link_url,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at,
    userName: r.user_name,
  }));
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return { notifications, unreadCount };
}

/* ----------------------------------------------------------------- cases */

export interface CaseRow {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  studentHalaqah: string | null;
  studentPhoto: string | null;
  reporterId: string;
  reporterName: string;
  title: string;
  description: string | null;
  category: string;
  status: "open" | "in_progress" | "resolved";
  followUpCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getCases(filters?: {
  status?: string;
  category?: string;
  studentId?: string;
  reporterId?: string;
  search?: string;
}): Promise<{ cases: CaseRow[]; summary: { total: number; open: number; inProgress: number; resolved: number } }> {
  let query = `
    SELECT
      sc.id, sc.student_id, sc.reporter_id, sc.title, sc.description, sc.category,
      sc.status, sc.created_at, sc.updated_at,
      s.full_name AS student_name, s.nis AS student_nis, s.class_name AS student_class,
      s.halaqah_name AS student_halaqah, s.photo_url AS student_photo,
      u.full_name AS reporter_name,
      (SELECT COUNT(*) FROM case_follow_ups cf WHERE cf.case_id = sc.id) AS follow_up_count
    FROM special_cases sc
    JOIN students s ON sc.student_id = s.id
    JOIN users u ON sc.reporter_id = u.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.status && filters.status !== "all") {
    conditions.push("sc.status = ?");
    params.push(filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    conditions.push("sc.category = ?");
    params.push(filters.category);
  }
  if (filters?.studentId) {
    conditions.push("sc.student_id = ?");
    params.push(filters.studentId);
  }
  if (filters?.reporterId) {
    conditions.push("sc.reporter_id = ?");
    params.push(filters.reporterId);
  }
  if (filters?.search) {
    conditions.push(
      "(sc.title LIKE ? OR sc.description LIKE ? OR s.full_name LIKE ? OR s.nis LIKE ?)"
    );
    const like = `%${filters.search}%`;
    params.push(like, like, like, like);
  }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY sc.created_at DESC";

  const rows = await db.prepare(query).all<any>(...params);
  const cases = rows.map((r) => ({
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name,
    studentNis: r.student_nis,
    studentClass: r.student_class,
    studentHalaqah: r.student_halaqah,
    studentPhoto: r.student_photo,
    reporterId: r.reporter_id,
    reporterName: r.reporter_name,
    title: r.title,
    description: r.description,
    category: r.category,
    status: r.status,
    followUpCount: r.follow_up_count ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })) as CaseRow[];

  return {
    cases,
    summary: {
      total: cases.length,
      open: cases.filter((c) => c.status === "open").length,
      inProgress: cases.filter((c) => c.status === "in_progress").length,
      resolved: cases.filter((c) => c.status === "resolved").length,
    },
  };
}

export async function getCaseFollowUps(
  caseId: string
): Promise<FollowUpNote[]> {
  const rows = await db
    .prepare(
      "SELECT id, by_user, at, note FROM case_follow_ups WHERE case_id = ? ORDER BY at DESC, rowid DESC"
    )
    .all<any>(caseId);
  return rows.map((r) => ({
    id: r.id,
    by: r.by_user,
    at: r.at,
    note: r.note,
  }));
}

/* ----------------------------------------------------------------- stats */

export interface StatsResult {
  overview: {
    totalStudents: number;
    attendancePct: number;
    activeCases: number;
    totalGuru: number;
    hafalanThisMonth: number;
    behaviorsThisMonth: number;
  };
  charts: {
    studentsByClass: { label: string; value: number }[];
    attendanceTrend: { date: string; total: number; hadir: number; percentage: number }[];
    hafalanByClass: { label: string; value: number }[];
    behaviorTrend: { label: string; value: number }[];
    casesByStatus: { label: string; value: number }[];
  };
  details: {
    hafalan: { total: number; ziyadah: number; murojaah: number };
    behaviors: { total: number; positif: number; pelanggaran: number; berat: number };
  };
  guruStats: { myStudents: number; myAttendancePct: number; myActiveCases: number } | null;
}

/* ------------------------------------------------------------ exports */

export interface StudentReportData {
  student: StudentRow;
  attendance: any[];
  memorization: any[];
  behaviors: any[];
  adabAssessments: any[];
  progressRecords: any[];
  cases: CaseRow[];
  stats: {
    attendance: {
      total: number;
      hadir: number;
      terlambat: number;
      sakit: number;
      izin: number;
      alpha: number;
      percentage: number;
    };
    memorization: { totalAyahs: number; ziyadahCount: number; murojaahCount: number };
    behaviors: { total: number; positif: number; pelanggaran: number; berat: number };
    adab: { avgScore: number | null };
  };
}

export async function getStudentReportData(
  studentId: string
): Promise<StudentReportData | null> {
  const student = await getStudentById(studentId);
  if (!student) return null;

  const attendance = await db
    .prepare("SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC")
    .all(studentId);
  const memorization = await db
    .prepare("SELECT * FROM memorization WHERE student_id = ? ORDER BY date DESC")
    .all(studentId);
  const behaviors = await db
    .prepare("SELECT * FROM behaviors WHERE student_id = ? ORDER BY date DESC")
    .all(studentId);
  const adabAssessments = await db
    .prepare("SELECT * FROM adab_assessments WHERE student_id = ? ORDER BY date DESC")
    .all(studentId);
  const progressRecords = await db
    .prepare("SELECT * FROM progress_records WHERE student_id = ? ORDER BY recorded_at DESC")
    .all(studentId);
  const casesData = await getCases({ studentId });

  const totalAyahs = memorization.reduce(
    (sum: number, m: any) => sum + (m.ayah_end - m.ayah_start + 1),
    0
  );
  const adabAvg =
    adabAssessments.length > 0
      ? adabAssessments.reduce((s: number, a: any) => s + (a.average_score ?? 0), 0) /
        adabAssessments.length
      : null;

  return {
    student,
    attendance,
    memorization,
    behaviors,
    adabAssessments,
    progressRecords,
    cases: casesData.cases,
    stats: {
      attendance: {
        total: attendance.length,
        hadir: attendance.filter((a: any) => a.status === "hadir").length,
        terlambat: attendance.filter((a: any) => a.status === "terlambat").length,
        sakit: attendance.filter((a: any) => a.status === "sakit").length,
        izin: attendance.filter((a: any) => a.status === "izin").length,
        alpha: attendance.filter((a: any) => a.status === "alpha").length,
        percentage:
          attendance.length > 0
            ? Math.round(
                ((attendance.filter((a: any) => ["hadir", "terlambat"].includes(a.status)).length /
                  attendance.length) *
                  100)
              )
            : 0,
      },
      memorization: {
        totalAyahs,
        ziyadahCount: memorization.filter((m: any) => m.type === "ziyadah").length,
        murojaahCount: memorization.filter((m: any) => m.type === "murojaah").length,
      },
      behaviors: {
        total: behaviors.length,
        positif: behaviors.filter((b: any) => b.type === "positif").length,
        pelanggaran: behaviors.filter((b: any) => b.type === "pelanggaran").length,
        berat: behaviors.filter((b: any) => b.severity === "berat").length,
      },
      adab: { avgScore: adabAvg ? Math.round(adabAvg * 10) / 10 : null },
    },
  };
}

export interface ClassReportData {
  className: string;
  students: StudentRow[];
  studentSummaries: {
    studentId: string;
    attendanceSummary: { total: number; hadir: number; percentage: number };
    hafalanSummary: { total: number; ziyadah: number; murojaah: number };
    behaviorSummary: { total: number; positif: number; pelanggaran: number; berat: number };
    casesSummary: { total: number; open: number; inProgress: number; resolved: number };
  }[];
  attendanceSummary: { total: number; hadir: number; percentage: number };
  hafalanSummary: { total: number; ziyadah: number; murojaah: number };
  behaviorSummary: { total: number; positif: number; pelanggaran: number; berat: number };
  casesSummary: { total: number; open: number; inProgress: number; resolved: number };
}

export async function getClassReportData(
  classId: string
): Promise<ClassReportData | null> {
  const students = await getStudents({ classId });
  if (students.length === 0) return null;

  const className = students[0].class_name;
  const studentIds = students.map((s) => s.id);
  const placeholders = studentIds.map(() => "?").join(",");

  const attendance = await db
    .prepare(
      `SELECT a.*, s.full_name AS student_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.student_id IN (${placeholders}) ORDER BY a.date DESC`
    )
    .all(...studentIds);
  const memorization = await db
    .prepare(
      `SELECT m.*, s.full_name AS student_name FROM memorization m JOIN students s ON m.student_id = s.id WHERE m.student_id IN (${placeholders}) ORDER BY m.date DESC`
    )
    .all(...studentIds);
  const behaviors = await db
    .prepare(
      `SELECT b.*, s.full_name AS student_name FROM behaviors b JOIN students s ON b.student_id = s.id WHERE b.student_id IN (${placeholders}) ORDER BY b.date DESC`
    )
    .all(...studentIds);
  const casesData = await getCases();
  const classCases = casesData.cases.filter((c) => studentIds.includes(c.studentId));

  const studentSummaries = students.map((s) => {
    const sAttendance = attendance.filter((a: any) => a.student_id === s.id);
    const sMemorization = memorization.filter((m: any) => m.student_id === s.id);
    const sBehaviors = behaviors.filter((b: any) => b.student_id === s.id);
    const sCases = classCases.filter((c) => c.studentId === s.id);

    return {
      studentId: s.id,
      attendanceSummary: {
        total: sAttendance.length,
        hadir: sAttendance.filter((a: any) => ["hadir", "terlambat"].includes(a.status)).length,
        percentage:
          sAttendance.length > 0
            ? Math.round(
                (sAttendance.filter((a: any) => ["hadir", "terlambat"].includes(a.status)).length /
                  sAttendance.length) *
                  100
              )
            : 0,
      },
      hafalanSummary: {
        total: sMemorization.reduce((sum: number, m: any) => sum + (m.ayah_end - m.ayah_start + 1), 0),
        ziyadah: sMemorization.filter((m: any) => m.type === "ziyadah").length,
        murojaah: sMemorization.filter((m: any) => m.type === "murojaah").length,
      },
      behaviorSummary: {
        total: sBehaviors.length,
        positif: sBehaviors.filter((b: any) => b.type === "positif").length,
        pelanggaran: sBehaviors.filter((b: any) => b.type === "pelanggaran").length,
        berat: sBehaviors.filter((b: any) => b.severity === "berat").length,
      },
      casesSummary: {
        total: sCases.length,
        open: sCases.filter((c) => c.status === "open").length,
        inProgress: sCases.filter((c) => c.status === "in_progress").length,
        resolved: sCases.filter((c) => c.status === "resolved").length,
      },
    };
  });

  return {
    className,
    students,
    studentSummaries,
    attendanceSummary: {
      total: attendance.length,
      hadir: attendance.filter((a: any) => ["hadir", "terlambat"].includes(a.status)).length,
      percentage:
        attendance.length > 0
          ? Math.round(
              (attendance.filter((a: any) => ["hadir", "terlambat"].includes(a.status)).length /
                attendance.length) *
                100
            )
          : 0,
    },
    hafalanSummary: {
      total: memorization.reduce((s: number, m: any) => s + (m.ayah_end - m.ayah_start + 1), 0),
      ziyadah: memorization.filter((m: any) => m.type === "ziyadah").length,
      murojaah: memorization.filter((m: any) => m.type === "murojaah").length,
    },
    behaviorSummary: {
      total: behaviors.length,
      positif: behaviors.filter((b: any) => b.type === "positif").length,
      pelanggaran: behaviors.filter((b: any) => b.type === "pelanggaran").length,
      berat: behaviors.filter((b: any) => b.severity === "berat").length,
    },
    casesSummary: {
      total: classCases.length,
      open: classCases.filter((c) => c.status === "open").length,
      inProgress: classCases.filter((c) => c.status === "in_progress").length,
      resolved: classCases.filter((c) => c.status === "resolved").length,
    },
  };
}

export async function getStats(
  userId?: string,
  role?: UserRole
): Promise<StatsResult> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const weekStart = fmt(startOfWeek);
  const monthStart = fmt(startOfMonth);
  const today = fmt(now);

  const totalStudents = await count(
    "SELECT COUNT(*) AS c FROM students WHERE status = 'aktif'"
  );

  const attWeek = await db
    .prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN status IN ('hadir','terlambat') THEN 1 ELSE 0 END) AS hadir
       FROM attendance WHERE date >= ?`
    )
    .get<{ total: number; hadir: number | null }>(weekStart);

  const activeCases = await count(
    "SELECT COUNT(*) AS c FROM special_cases WHERE status IN ('open','in_progress')"
  );

  const totalGuru = await count(
    "SELECT COUNT(*) AS c FROM users WHERE role = 'guru' AND status = 'active'"
  );

  const hafalanMonth = await db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN type = 'ziyadah' THEN 1 ELSE 0 END) AS ziyadah,
              SUM(CASE WHEN type = 'murojaah' THEN 1 ELSE 0 END) AS murojaah
       FROM memorization WHERE date >= ?`
    )
    .get<{ total: number; ziyadah: number | null; murojaah: number | null }>(monthStart);

  const behaviorsMonth = await db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN type = 'positif' THEN 1 ELSE 0 END) AS positif,
              SUM(CASE WHEN type = 'pelanggaran' THEN 1 ELSE 0 END) AS pelanggaran,
              SUM(CASE WHEN severity = 'berat' THEN 1 ELSE 0 END) AS berat
       FROM behaviors WHERE date >= ?`
    )
    .get<{ total: number; positif: number | null; pelanggaran: number | null; berat: number | null }>(
      monthStart
    );

  const studentsByClass = await db
    .prepare(
      `SELECT class_name AS label, COUNT(*) AS value FROM students WHERE status = 'aktif'
       GROUP BY class_name ORDER BY class_name`
    )
    .all<{ label: string; value: number }>();

  const attendanceTrend = await db
    .prepare(
      `SELECT date AS label, COUNT(*) AS total,
              SUM(CASE WHEN status IN ('hadir','terlambat') THEN 1 ELSE 0 END) AS hadir
       FROM attendance WHERE date >= ? AND date <= ? GROUP BY date ORDER BY date`
    )
    .all<{ label: string; total: number; hadir: number | null }>(weekStart, today);

  const hafalanByClass = await db
    .prepare(
      `SELECT s.class_name AS label, COUNT(*) AS value
       FROM memorization m JOIN students s ON m.student_id = s.id
       WHERE m.date >= ? GROUP BY s.class_name ORDER BY value DESC`
    )
    .all<{ label: string; value: number }>(monthStart);

  const behaviorTrend = await db
    .prepare("SELECT type AS label, COUNT(*) AS value FROM behaviors WHERE date >= ? GROUP BY type")
    .all<{ label: string; value: number }>(monthStart);

  const casesByStatus = await db
    .prepare("SELECT status AS label, COUNT(*) AS value FROM special_cases GROUP BY status")
    .all<{ label: string; value: number }>();

  let guruStats: StatsResult["guruStats"] = null;
  if (role === "guru" && userId) {
    const halaqahId = await getGuruHalaqahId(userId);
    if (halaqahId) {
      const myStudents = await count(
        "SELECT COUNT(*) AS c FROM students WHERE halaqah_id = ? AND status = 'aktif'",
        halaqahId
      );

      const myAtt = await db
        .prepare(
          `SELECT COUNT(*) AS total, SUM(CASE WHEN status IN ('hadir','terlambat') THEN 1 ELSE 0 END) AS hadir
           FROM attendance WHERE halaqah_id = ? AND date >= ?`
        )
        .get<{ total: number; hadir: number | null }>(halaqahId, weekStart);

      const myCases = await count(
        `SELECT COUNT(*) AS c FROM special_cases sc JOIN students s ON sc.student_id = s.id
         WHERE s.halaqah_id = ? AND sc.status IN ('open','in_progress')`,
        halaqahId
      );

      guruStats = {
        myStudents,
        myAttendancePct:
          myAtt && myAtt.total > 0 ? Math.round(((myAtt.hadir ?? 0) / myAtt.total) * 100) : 0,
        myActiveCases: myCases,
      };
    }
  }

  return {
    overview: {
      totalStudents,
      attendancePct:
        attWeek && attWeek.total > 0 ? Math.round(((attWeek.hadir ?? 0) / attWeek.total) * 100) : 0,
      activeCases,
      totalGuru,
      hafalanThisMonth: hafalanMonth?.total ?? 0,
      behaviorsThisMonth: behaviorsMonth?.total ?? 0,
    },
    charts: {
      studentsByClass,
      attendanceTrend: attendanceTrend.map((d) => ({
        date: d.label,
        total: d.total,
        hadir: d.hadir ?? 0,
        percentage: d.total > 0 ? Math.round(((d.hadir ?? 0) / d.total) * 100) : 0,
      })),
      hafalanByClass,
      behaviorTrend,
      casesByStatus,
    },
    details: {
      hafalan: {
        total: hafalanMonth?.total ?? 0,
        ziyadah: hafalanMonth?.ziyadah ?? 0,
        murojaah: hafalanMonth?.murojaah ?? 0,
      },
      behaviors: {
        total: behaviorsMonth?.total ?? 0,
        positif: behaviorsMonth?.positif ?? 0,
        pelanggaran: behaviorsMonth?.pelanggaran ?? 0,
        berat: behaviorsMonth?.berat ?? 0,
      },
    },
    guruStats,
  };
}

/* ------------------------------------------------------------ interfaces */

export interface StudentRow {
  id: string;
  nis: string;
  full_name: string;
  gender: string;
  birth_date: string;
  birth_place: string;
  address: string | null;
  class_id: string | null;
  class_name: string;
  halaqah_id: string | null;
  halaqah_name: string | null;
  kelas_id: string | null;
  kelas_name: string | null;
  academic_year_id: string | null;
  enrollment_date: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  photo_url: string | null;
  status: string;
  notes: string | null;
}

export interface FollowUpNote {
  id: string;
  by: string | null;
  at: string;
  note: string;
}
