import { Class } from "../types";

export const mockClasses: Class[] = [
  {
    id: "class-1",
    name: "Umar bin Khattab",
    code: "KAF-A",
    level: "A",
    academicYearId: "ay-4",
    homeroomTeacherId: "user-2",
    createdAt: new Date("2024-07-01"),
  },
  {
    id: "class-2",
    name: "Abu Bakar As-Siddiq",
    code: "KAF-B",
    level: "B",
    academicYearId: "ay-4",
    homeroomTeacherId: "user-3",
    createdAt: new Date("2024-07-01"),
  },
  {
    id: "class-3",
    name: "Usman bin Affan",
    code: "KAF-C",
    level: "C",
    academicYearId: "ay-4",
    homeroomTeacherId: "user-4",
    createdAt: new Date("2024-07-01"),
  },
];

export const getClassById = (id: string) => mockClasses.find(c => c.id === id);
