import { User, Role, UserStatus } from "@/lib/types";

export const mockUsers: User[] = [
  // ADMIN
  {
    id: "admin-001",
    clerkId: "clerk_admin_001",
    email: "admin@kuttabal-fatih.sch.id",
    fullName: "Admin Kuttab Al-Fatih",
    role: "admin",
    phone: "08123456789",
    avatarUrl: "/avatars/admin.jpg",
    status: "active",
    mustChangePassword: false,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-09-01"),
  },

  // GURU
  {
    id: "guru-001",
    clerkId: "clerk_guru_001",
    email: "rizki.firmansyah@kuttabal-fatih.sch.id",
    fullName: "Ustadz Rizki Firmansyah",
    role: "guru",
    phone: "08234567890",
    avatarUrl: "/avatars/guru-1.jpg",
    status: "active",
    mustChangePassword: false,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-09-10"),
  },
  {
    id: "guru-002",
    clerkId: "clerk_guru_002",
    email: "sari.amelia@kuttabal-fatih.sch.id",
    fullName: "Ustadzah Sari Amelia",
    role: "guru",
    phone: "08345678901",
    avatarUrl: "/avatars/guru-2.jpg",
    status: "active",
    mustChangePassword: false,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-09-08"),
  },
  {
    id: "guru-003",
    clerkId: "clerk_guru_003",
    email: "hilmi.rahman@kuttabal-fatih.sch.id",
    fullName: "Ustadz Hilmi Rahman",
    role: "guru",
    phone: "08456789012",
    avatarUrl: "/avatars/guru-3.jpg",
    status: "active",
    mustChangePassword: false,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-09-05"),
  },

  // MANAJEMEN
  {
    id: "manajemen-001",
    clerkId: "clerk_manajemen_001",
    email: "hendra.wijaya@kuttabal-fatih.sch.id",
    fullName: "Ustadz Dr. Hendra Wijaya",
    role: "manajemen",
    phone: "08567890123",
    avatarUrl: "/avatars/manajemen-1.jpg",
    status: "active",
    mustChangePassword: false,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-09-12"),
  },
  {
    id: "manajemen-002",
    clerkId: "clerk_manajemen_002",
    email: "ratna.kusuma@kuttabal-fatih.sch.id",
    fullName: "Ustadzah Ratna Kusuma",
    role: "manajemen",
    phone: "08678901234",
    avatarUrl: "/avatars/manajemen-2.jpg",
    status: "active",
    mustChangePassword: false,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-09-10"),
  },
];

export const getMockUserByRole = (role: Role): User[] => {
  return mockUsers.filter((user) => user.role === role);
};

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};
