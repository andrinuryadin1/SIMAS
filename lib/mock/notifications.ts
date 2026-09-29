import { Notification, NotificationType } from "@/lib/types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    userId: "guru-001",
    type: "reminder_weekly",
    title: "Pengingat Mingguan",
    message: "Assalamu'alaikum Ustadz, mohon lengkapi input perkembangan santri pekan ini.",
    linkUrl: "/guru/dashboard",
    isRead: false,
    createdAt: new Date("2024-09-21T14:00:00"),
  },
  {
    id: "notif-002",
    userId: "guru-001",
    type: "attendance_alpha",
    title: "Pemberitahuan Absensi",
    message: "Muhammad Ihsan telah alpha 3 hari berturut-turut. Segera hubungi wali murid.",
    linkUrl: "/guru/santri/student-003",
    isRead: true,
    createdAt: new Date("2024-09-20T16:30:00"),
  },
  {
    id: "notif-003",
    userId: "guru-001",
    type: "case_new",
    title: "Kasus Baru Dilaporkan",
    message: "Kasus baru untuk Aisyah Nur Hamidah: Sakit Berkepanjangan. Silakan tinjau dan ambil tindakan.",
    linkUrl: "/guru/kasus",
    isRead: true,
    createdAt: new Date("2024-09-15T09:15:00"),
  },
  {
    id: "notif-004",
    userId: "guru-001",
    type: "behavior_heavy",
    title: "Pelanggaran Berat Tercatat",
    message: "Pelanggaran berat telah dicatat untuk Muhammad Ihsan. Segera hubungi wali murid dan manajemen.",
    linkUrl: "/guru/perilaku",
    isRead: true,
    createdAt: new Date("2024-09-18T10:45:00"),
  },
  {
    id: "notif-005",
    userId: "manajemen-001",
    type: "case_new",
    title: "Kasus Baru Memerlukan Perhatian",
    message: "Kasus baru: Muhammad Ihsan - Ketidakhadiran Berulang. Status: In-Progress",
    linkUrl: "/manajemen/kasus",
    isRead: false,
    createdAt: new Date("2024-09-21T11:20:00"),
  },
  {
    id: "notif-006",
    userId: "manajemen-001",
    type: "system",
    title: "Update Data Master",
    message: "Admin telah menambahkan tahun ajaran baru: 2025/2026 Semester Ganjil",
    linkUrl: "/manajemen/dashboard",
    isRead: true,
    createdAt: new Date("2024-09-19T08:00:00"),
  },
];

export const getMockNotificationsByUser = (
  userId: string,
  limit = 20
): Notification[] => {
  return mockNotifications
    .filter((n) => n.userId === userId)
    .slice(0, limit);
};

export const getMockUnreadNotifications = (userId: string): Notification[] => {
  return mockNotifications.filter((n) => n.userId === userId && !n.isRead);
};

export const getMockUnreadCount = (userId: string): number => {
  return mockNotifications.filter((n) => n.userId === userId && !n.isRead)
    .length;
};
