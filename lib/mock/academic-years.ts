import { AcademicYear } from "../types";

export const mockAcademicYears: AcademicYear[] = [
  {
    id: "ay-1",
    name: "2024/2025",
    semester: "ganjil",
    startDate: "2024-07-01",
    endDate: "2024-12-31",
    isActive: false,
    createdAt: new Date("2024-06-01"),
  },
  {
    id: "ay-2",
    name: "2024/2025",
    semester: "genap",
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    isActive: false,
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "ay-3",
    name: "2025/2026",
    semester: "ganjil",
    startDate: "2025-07-01",
    endDate: "2025-12-31",
    isActive: false,
    createdAt: new Date("2025-06-01"),
  },
  {
    id: "ay-4",
    name: "2025/2026",
    semester: "genap",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    isActive: true,
    createdAt: new Date("2025-12-01"),
  },
];

export const getActiveAcademicYear = () => mockAcademicYears.find(ay => ay.isActive);
