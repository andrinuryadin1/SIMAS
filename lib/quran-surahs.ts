/**
 * lib/quran-surahs.ts
 *
 * Data lengkap 114 surah Al-Qur'an beserta jumlah ayat-ayatnya.
 * Dipakai di halaman Hafalan supaya dropdown surah akurat (114 surah, jumlah
 * ayat benar) danyatRangeStart/End otomatis mengikuti panjang surah.
 *
 * Format: { id, name, arab, number, ayat }
 * - id     : "1" .. "114" (dipakai sebagai value dropdown)
 * - name   : nama latin, c.Contoh: "Al-Baqarah"
 * - arab   : nama Arab, c.Contoh: "البقرة"
 * - number : nomor urut surah (1 = Al-Fatihah, 114 = An-Nas)
 * - ayat   : jumlah ayat
 */
export const QuranSurahs = [
  { id: "1", name: "Al-Fatiha", arab: "الفاتحة", number: 1, ayat: 7 },
  { id: "2", name: "Al-Baqarah", arab: "البقرة", number: 2, ayat: 286 },
  { id: "3", name: "Ali 'Imran", arab: "آل عمران", number: 3, ayat: 200 },
  { id: "4", name: "An-Nisa", arab: "النساء", number: 4, ayat: 176 },
  { id: "5", name: "Al-Ma'idah", arab: "المائدة", number: 5, ayat: 120 },
  { id: "6", name: "Al-An'am", arab: "الأنعام", number: 6, ayat: 165 },
  { id: "7", name: "Al-A'raf", arab: "الأعراف", number: 7, ayat: 206 },
  { id: "8", name: "Al-Anfal", arab: "الأنفال", number: 8, ayat: 75 },
  { id: "9", name: "At-Tawbah", arab: "التوبة", number: 9, ayat: 129 },
  { id: "10", name: "Yunus", arab: "يونس", number: 10, ayat: 109 },
  { id: "11", name: "Hud", arab: "هود", number: 11, ayat: 123 },
  { id: "12", name: "Yusuf", arab: "يوسف", number: 12, ayat: 111 },
  { id: "13", name: "Ar-Ra'd", arab: "الرعد", number: 13, ayat: 43 },
  { id: "14", name: "Ibrahim", arab: "إبراهيم", number: 14, ayat: 52 },
  { id: "15", name: "Al-Hijr", arab: "الحجر", number: 15, ayat: 99 },
  { id: "16", name: "An-Nahl", arab: "النحل", number: 16, ayat: 128 },
  { id: "17", name: "Al-Isra", arab: "الإسراء", number: 17, ayat: 111 },
  { id: "18", name: "Al-Kahf", arab: "الكهف", number: 18, ayat: 110 },
  { id: "19", name: "Maryam", arab: "مريم", number: 19, ayat: 98 },
  { id: "20", name: "Ta-Ha", arab: "طه", number: 20, ayat: 135 },
  { id: "21", name: "Al-Anbiya", arab: "الأنبياء", number: 21, ayat: 112 },
  { id: "22", name: "Al-Hajj", arab: "الحج", number: 22, ayat: 78 },
  { id: "23", name: "Al-Mu'minun", arab: "المؤمنون", number: 23, ayat: 118 },
  { id: "24", name: "An-Nur", arab: "النور", number: 24, ayat: 64 },
  { id: "25", name: "Al-Furqan", arab: "الفرقان", number: 25, ayat: 77 },
  { id: "26", name: "Ash-Shu'ara", arab: "الشعراء", number: 26, ayat: 227 },
  { id: "27", name: "An-Naml", arab: "النمل", number: 27, ayat: 93 },
  { id: "28", name: "Al-Qasas", arab: "القصص", number: 28, ayat: 88 },
  { id: "29", name: "Al-Ankabut", arab: "العنكبوت", number: 29, ayat: 69 },
  { id: "30", name: "Ar-Rum", arab: "الروم", number: 30, ayat: 60 },
  { id: "31", name: "Luqman", arab: "لقمان", number: 31, ayat: 34 },
  { id: "32", name: "As-Sajdah", arab: "السجدة", number: 32, ayat: 30 },
  { id: "33", name: "Al-Ahzab", arab: "الأحزاب", number: 33, ayat: 73 },
  { id: "34", name: "Saba", arab: "سبإ", number: 34, ayat: 54 },
  { id: "35", name: "Fatir", arab: "فاطر", number: 35, ayat: 45 },
  { id: "36", name: "Ya-Sin", arab: "يس", number: 36, ayat: 83 },
  { id: "37", name: "As-Saffat", arab: "الصافات", number: 37, ayat: 182 },
  { id: "38", name: "Sad", arab: "ص", number: 38, ayat: 88 },
  { id: "39", name: "Az-Zumar", arab: "زمر", number: 39, ayat: 75 },
  { id: "40", name: "Ghafir", arab: "غافر", number: 40, ayat: 85 },
  { id: "41", name: "Fussilat", arab: "فصلت", number: 41, ayat: 54 },
  { id: "42", name: "Ash-Shura", arab: "الشورى", number: 42, ayat: 53 },
  { id: "43", name: "Az-Zukhruf", arab: "الزخرف", number: 43, ayat: 89 },
  { id: "44", name: "Ad-Dukhan", arab: "الدخان", number: 44, ayat: 59 },
  { id: "45", name: "Al-Jathiyah", arab: "الجاثية", number: 45, ayat: 37 },
  { id: "46", name: "Al-Ahqaf", arab: "الأحقاف", number: 46, ayat: 35 },
  { id: "47", name: "Muhammad", arab: "محمد", number: 47, ayat: 38 },
  { id: "48", name: "Al-Fath", arab: "الفتح", number: 48, ayat: 29 },
  { id: "49", name: "Al-Hujurat", arab: "الحجرات", number: 49, ayat: 18 },
  { id: "50", name: "Qaf", arab: "ق", number: 50, ayat: 45 },
  { id: "51", name: "Az-Zariyat", arab: "الذاريات", number: 51, ayat: 60 },
  { id: "52", name: "At-Tur", arab: "الطور", number: 52, ayat: 49 },
  { id: "53", name: "An-Najm", arab: "النجم", number: 53, ayat: 62 },
  { id: "54", name: "Al-Qamar", arab: "القمر", number: 54, ayat: 55 },
  { id: "55", name: "Ar-Rahman", arab: "الرحمن", number: 55, ayat: 78 },
  { id: "56", name: "Al-Waqi'ah", arab: "الواقعة", number: 56, ayat: 96 },
  { id: "57", name: "Al-Hadid", arab: "الحديد", number: 57, ayat: 29 },
  { id: "58", name: "Al-Mujadila", arab: "المجادلة", number: 58, ayat: 22 },
  { id: "59", name: "Al-Hashr", arab: "الحشر", number: 59, ayat: 24 },
  { id: "60", name: "Al-Mumtahina", arab: "الممتحنة", number: 60, ayat: 13 },
  { id: "61", name: "As-Saff", arab: "الصف", number: 61, ayat: 14 },
  { id: "62", name: "Al-Jumu'ah", arab: "الجمعة", number: 62, ayat: 11 },
  { id: "63", name: "Al-Munafiqun", arab: "المنافقون", number: 63, ayat: 11 },
  { id: "64", name: "At-Taghabun", arab: "التغابن", number: 64, ayat: 18 },
  { id: "65", name: "At-Talaq", arab: "الطلاق", number: 65, ayat: 12 },
  { id: "66", name: "At-Tahrim", arab: "التحريم", number: 66, ayat: 12 },
  { id: "67", name: "Al-Mulk", arab: "الملك", number: 67, ayat: 30 },
  { id: "68", name: "Al-Qalam", arab: "القلم", number: 68, ayat: 52 },
  { id: "69", name: "Al-Haqqah", arab: "الحاقة", number: 69, ayat: 52 },
  { id: "70", name: "Al-Ma'arij", arab: "المعارج", number: 70, ayat: 44 },
  { id: "71", name: "Nuh", arab: "نوح", number: 71, ayat: 28 },
  { id: "72", name: "Al-Jinn", arab: "الجن", number: 72, ayat: 28 },
  { id: "73", name: "Al-Muzzammil", arab: "المزمل", number: 73, ayat: 20 },
  { id: "74", name: "Al-Muddathir", arab: "المدثر", number: 74, ayat: 56 },
  { id: "75", name: "Al-Qiyamah", arab: "القيامة", number: 75, ayat: 40 },
  { id: "76", name: "Al-Insan", arab: "الانسان", number: 76, ayat: 31 },
  { id: "77", name: "Al-Mursalat", arab: "المرسلات", number: 77, ayat: 50 },
  { id: "78", name: "An-Naba", arab: "النبأ", number: 78, ayat: 40 },
  { id: "79", name: "An-Nazi'at", arab: "النازعات", number: 79, ayat: 46 },
  { id: "80", name: "'Abasa", arab: "عبس", number: 80, ayat: 42 },
  { id: "81", name: "At-Takwir", arab: "التكوير", number: 81, ayat: 29 },
  { id: "82", name: "Al-Infitar", arab: "الانفطار", number: 82, ayat: 19 },
  { id: "83", name: "Al-Mutaffifin", arab: "المطففين", number: 83, ayat: 36 },
  { id: "84", name: "Al-Inshiqaq", arab: "الانشقاق", number: 84, ayat: 25 },
  { id: "85", name: "Al-Buruj", arab: "البروج", number: 85, ayat: 22 },
  { id: "86", name: "At-Tariq", arab: "الطارق", number: 86, ayat: 17 },
  { id: "87", name: "Al-A'lam", arab: "الأعلى", number: 87, ayat: 19 },
  { id: "88", name: "Al-Ghashiyah", arab: "الغاشية", number: 88, ayat: 26 },
  { id: "89", name: "Al-Fajr", arab: "الفجر", number: 89, ayat: 30 },
  { id: "90", name: "Al-Balad", arab: "البلد", number: 90, ayat: 20 },
  { id: "91", name: "Ash-Shams", arab: "الشمس", number: 91, ayat: 15 },
  { id: "92", name: "Al-Layl", arab: "الليل", number: 92, ayat: 21 },
  { id: "93", name: "Ad-Duha", arab: "الضحى", number: 93, ayat: 11 },
  { id: "94", name: "Al-Inshirah", arab: "الشرح", number: 94, ayat: 8 },
  { id: "95", name: "At-Tin", arab: "التين", number: 95, ayat: 8 },
  { id: "96", name: "Al-'Alaq", arab: "العلق", number: 96, ayat: 19 },
  { id: "97", name: "Al-Qadr", arab: "القدر", number: 97, ayat: 5 },
  { id: "98", name: "Al-Bayyina", arab: "البينة", number: 98, ayat: 8 },
  { id: "99", name: "Az-Zalzala", arab: "الزلزلة", number: 99, ayat: 8 },
  { id: "100", name: "Al-'Adiyat", arab: "العاديات", number: 100, ayat: 11 },
  { id: "101", name: "Al-Qari'a", arab: "القارعة", number: 101, ayat: 11 },
  { id: "102", name: "At-Takathur", arab: "التكاثر", number: 102, ayat: 8 },
  { id: "103", name: "Al-'Asr", arab: "العصر", number: 103, ayat: 3 },
  { id: "104", name: "Al-Humazah", arab: "الهمزة", number: 104, ayat: 9 },
  { id: "105", name: "Al-Fil", arab: "الفيل", number: 105, ayat: 5 },
  { id: "106", name: "Quraysh", arab: "قريش", number: 106, ayat: 4 },
  { id: "107", name: "Al-Ma'un", arab: "الماعون", number: 107, ayat: 7 },
  { id: "108", name: "Al-Kawthar", arab: "الكوثر", number: 108, ayat: 3 },
  { id: "109", name: "Al-Kafirun", arab: "الكافرون", number: 109, ayat: 6 },
  { id: "110", name: "An-Nasr", arab: "النصر", number: 110, ayat: 3 },
  { id: "111", name: "Al-Masad", arab: "المسد", number: 111, ayat: 5 },
  { id: "112", name: "Al-Ikhlas", arab: "الإخلاص", number: 112, ayat: 4 },
  { id: "113", name: "Al-Falaq", arab: "الفلق", number: 113, ayat: 5 },
  { id: "114", name: "An-Nas", arab: "الناس", number: 114, ayat: 6 },
];

/** Helper: cari surah berdasarkan nomor (1-114) atau nama latin (case-insensitive). */
export function findSurah(query: number | string): (typeof QuranSurahs)[number] | undefined {
  if (typeof query === "number") return QuranSurahs.find((s) => s.number === query);
  const q = query.trim().toLowerCase();
  return QuranSurahs.find((s) => s.name.toLowerCase() === q);
}

/**
 * Pembatas surah per juz (Hizb). Dipakai untuk memberi konteks ke guru ketika
 * mencatat setoran: ayat berapa sampai berapa surah ini berada di juz berapa.
 *
 * 30 juz × 2 hizb = 60 hizb. Setiap hizb ~ 2 halaman mushaf.
 * Surah 1-4 (Al-Fatihah) ada di Juz 1, lalu setiap ~2-3 surah maju ke juz berikutnya.
 * Referensi: mushaf standar Madinah.
 */
const JUZ_HIZB_BOUNDARIES: Array<{ juz: number; startSurah: number }> = [
  { juz: 1, startSurah: 1 },
  { juz: 2, startSurah: 5 },
  { juz: 3, startSurah: 10 },
  { juz: 4, startSurah: 14 },
  { juz: 5, startSurah: 18 },
  { juz: 6, startSurah: 23 },
  { juz: 7, startSurah: 28 },
  { juz: 8, startSurah: 33 },
  { juz: 9, startSurah: 37 },
  { juz: 10, startSurah: 41 },
  { juz: 11, startSurah: 46 },
  { juz: 12, startSurah: 51 },
  { juz: 13, startSurah: 58 },
  { juz: 14, startSurah: 62 },
  { juz: 15, startSurah: 67 },
  { juz: 16, startSurah: 72 },
  { juz: 17, startSurah: 77 },
  { juz: 18, startSurah: 83 },
  { juz: 19, startSurah: 89 },
  { juz: 20, startSurah: 94 },
  { juz: 21, startSurah: 100 },
  { juz: 22, startSurah: 103 },
  { juz: 23, startSurah: 106 },
  { juz: 24, startSurah: 109 },
  { juz: 25, startSurah: 112 },
  { juz: 26, startSurah: 114 },
  { juz: 27, startSurah: 114 },
  { juz: 28, startSurah: 114 },
  { juz: 29, startSurah: 114 },
  { juz: 30, startSurah: 114 },
];

/**
 * Rentang juz tempat sebuah surah berada. Surah besar seperti Al-Baqarah
 * membentang beberapa juz, jadi return { start, end } (bisa sama).
 */
export function getJuzRange(surahNumber: number): { start: number; end: number } {
  let idx = 0;
  for (let i = 0; i < JUZ_HIZB_BOUNDARIES.length; i++) {
    if (JUZ_HIZB_BOUNDARIES[i].startSurah <= surahNumber) idx = i;
    else break;
  }
  return {
    start: JUZ_HIZB_BOUNDARIES[idx].juz,
    end: JUZ_HIZB_BOUNDARIES[idx].juz,
  };
}
