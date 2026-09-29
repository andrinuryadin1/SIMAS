import { TeachingJournal } from "@/lib/types";

export const mockTeachingJournals: TeachingJournal[] = [
  {
    id: "journal-001",
    teacherId: "guru-001",
    halaqahId: "halaqah-001",
    subjectId: "subject-001",
    date: "2024-09-21",
    topic: "Tahfidz Surah An-Naba",
    method: "Klasikal dengan pendampingan individual",
    summary:
      "Santri melanjutkan ziyadah surah An-Naba ayat 1-40. Sebagian besar santri sudah mencapai kualitas A-B, ada 1 santri yang masih kualitas C yang butuh perhatian khusus.",
    obstacles:
      "Konsentrasi santri berkurang di 20 menit terakhir, mungkin karena kelelahan",
    reflection:
      "Perlu menyesuaikan durasi pembelajaran dan memberikan ice breaking di tengah pelajaran. Akan dimulai lebih pagi agar santri lebih fresh.",
    createdAt: new Date("2024-09-21"),
  },
  {
    id: "journal-002",
    teacherId: "guru-001",
    halaqahId: "halaqah-001",
    subjectId: "subject-002",
    date: "2024-09-20",
    topic: "Adab dalam Menjalankan Ibadah",
    method: "Diskusi interaktif dan role-play",
    summary:
      "Pembahasan tentang adab saat berada di masjid. Santri sangat antusias berpartisipasi dalam diskusi. Dilakukan role-play tentang situasi yang tepat berbisik dan berbicara.",
    obstacles: "Beberapa santri kesulitan mengingat poin-poin penting",
    reflection:
      "Membuat ringkasan visual di whiteboard membantu pemahaman. Akan terus gunakan metode ini untuk materi yang kompleks.",
    createdAt: new Date("2024-09-20"),
  },
  {
    id: "journal-003",
    teacherId: "guru-001",
    halaqahId: "halaqah-001",
    subjectId: "subject-004",
    date: "2024-09-19",
    topic: "Operasi Penjumlahan 1-10",
    method: "Pembelajaran dengan manipulasi benda (biji-bijian)",
    summary:
      "Santri belajar penjumlahan menggunakan biji-bijian sebagai media. Semua santri aktif belajar dan sangat enjoyed. Pemahaman mereka lebih konkret dibanding metode abstrak.",
    obstacles: "Beberapa biji-bijian tercecer dan mengganggu konsentrasi",
    reflection:
      "Menyiapkan wadah yang lebih sesuai agar biji tidak tercecer. Metode ini sangat efektif, akan diulangi untuk topik matematika berikutnya.",
    createdAt: new Date("2024-09-19"),
  },
];

export const getMockJournalByTeacher = (
  teacherId: string,
  limit = 30
): TeachingJournal[] => {
  return mockTeachingJournals
    .filter((j) => j.teacherId === teacherId)
    .slice(0, limit);
};

export const getMockJournalByDate = (date: string): TeachingJournal[] => {
  return mockTeachingJournals.filter((j) => j.date === date);
};
