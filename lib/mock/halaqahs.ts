import { Halaqah } from "../types";

export const mockHalaqahs: Halaqah[] = [
  {
    id: "halaqah-1",
    name: "Halaqah Abu Bakar",
    classId: "class-1",
    teacherId: "user-2",
    createdAt: new Date("2024-07-01"),
  },
  {
    id: "halaqah-2",
    name: "Halaqah Umar",
    classId: "class-2",
    teacherId: "user-3",
    createdAt: new Date("2024-07-01"),
  },
  {
    id: "halaqah-3",
    name: "Halaqah Ali",
    classId: "class-3",
    teacherId: "user-4",
    createdAt: new Date("2024-07-01"),
  },
];

export const getHalaqahById = (id: string) => mockHalaqahs.find(h => h.id === id);
export const getHalaqahsByTeacher = (teacherId: string) => mockHalaqahs.filter(h => h.teacherId === teacherId);
