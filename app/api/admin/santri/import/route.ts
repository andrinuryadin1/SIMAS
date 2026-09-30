import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { createClient } from "@libsql/client";
import { getSessionOrError, generateId } from "@/lib/api-utils";
import { sanitizeText } from "@/lib/sanitize";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

/**
 * Kolom template CSV beserta keterangan. Dipakai oleh `GET` di route ini
 * supaya pengguna tahu persis format yang diharapkan endpoint.
 */
const TEMPLATE_COLUMNS = [
  { key: "nis", required: true, example: "240001", note: "Nomor Induk Santri, harus unik" },
  { key: "full_name", required: true, example: "Ahmad Fauzi", note: "Nama lengkapxel" },
  { key: "gender", required: true, example: "L", note: "L (Laki-laki) atau P (Perempuan)" },
  { key: "birth_date", required: true, example: "2013-05-17", note: "Format YYYY-MM-DD" },
  { key: "birth_place", required: true, example: "Bandung", note: "Tempat lahir" },
  { key: "class_name", required: false, example: "SD", note: "Jenjang. Bisa dikosongkan bila kelas_name diisi" },
  { key: "halaqah", required: false, example: "1", note: "Level. Bisa dikosongkan bila kelas_name diisi" },
  { key: "kelas_name", required: false, example: "A", note: "Nama Kelas (bisa \"A (1)\"). Mengisi jenjang & level otomatis" },
  { key: "academic_year", required: false, example: "2024/2025", note: "Tahun ajaran, harus sudah ada di master" },
  { key: "enrollment_date", required: false, example: "2024-07-01", note: "Tanggal masuk, default hari ini" },
  { key: "address", required: false, example: "Jl. Merdeka No. 10", note: "" },
  { key: "father_name", required: false, example: "Budi Santoso", note: "" },
  { key: "mother_name", required: false, example: "Siti Aminah", note: "" },
  { key: "guardian_name", required: false, example: "Budi Santoso", note: "" },
  { key: "guardian_phone", required: false, example: "08123456789", note: "" },
  { key: "photo_url", required: false, example: "", note: "URL foto (opsional)" },
  { key: "notes", required: false, example: "", note: "Catatan (opsional)" },
];

/** `GET /api/admin/santri/import` -> daftar kolom + contoh baris. */
export async function GET() {
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  return NextResponse.json({
    columns: TEMPLATE_COLUMNS,
    sampleRow: Object.fromEntries(TEMPLATE_COLUMNS.map((c) => [c.key, c.example])),
    notes: [
      "Minimal isi: nis, full_name, gender, birth_date, birth_place.",
      "Minimal salah satu dari class_name / halaqah / kelas_name harus diisi.",
      "Jenjang, Level, dan Kelas harus sudah terdaftar di Data Master, jika tidak baris akan ditolak.",
      "Format file: .csv, .xlsx, atau .xls (hanya sheet pertama yang dibaca).",
    ],
  });
}

export async function POST(request: NextRequest) {
  // ✅ Hanya admin yang boleh import
  const { error: authError } = await getSessionOrError(["admin"]);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    let records: Record<string, string>[] = [];

    if (fileName.endsWith(".csv")) {
      // Parse CSV
      const text = new TextDecoder().decode(buffer);
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
      });
      if (result.errors.length > 0) {
        console.warn("CSV parse warnings:", result.errors);
      }
      records = result.data as Record<string, string>[];
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      records = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });
    } else {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan CSV atau Excel (.xlsx/.xls)" },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: "File kosong atau tidak ada data valid" },
        { status: 400 }
      );
    }

    // Normalisasi field names
    const normalizedRecords = records.map((r) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(r)) {
        const normalizedKey = key
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        normalized[normalizedKey] = String(value ?? "").trim();
      }
      return normalized;
    });

    // Field wajib. Jenjang/Level boleh kosong asalkan `kelas_name` diisi,
    // karena kelas sudah membawa informasi Jenjang + Level.
    const baseRequired = ["nis", "full_name", "gender", "birth_date", "birth_place"];
    const placeFields = ["class_name", "halaqah", "kelas_name"];

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Pre-fetch master data untuk lookup
    const client = createClient({ url: process.env.TURSO_DATABASE_URL || "file:data/simas.db", authToken: process.env.TURSO_AUTH_TOKEN });
    const classes = (await client.execute({ sql: "SELECT id, name FROM classes" })).rows as unknown as { id: string; name: string }[];
    const halaqahs = (await client.execute({ sql: "SELECT id, name FROM halaqahs" })).rows as unknown as { id: string; name: string }[];
    const kelasList = (await client.execute({ sql: "SELECT id, name, level_id, level_name, jenjang_name FROM kelas" })).rows as unknown as {
      id: string;
      name: string;
      level_id: string | null;
      level_name: string | null;
      jenjang_name: string | null;
    }[];
    const academicYears = (await client.execute({ sql: "SELECT id, name FROM academic_years" })).rows as unknown as { id: string; name: string }[];

    const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c.id]));
    const halaqahMap = new Map(halaqahs.map((h) => [h.name.toLowerCase(), h.id]));
    const ayMap = new Map(academicYears.map((a) => [a.name.toLowerCase(), a.id]));
    // Kelas bisa diisi lewat `kelas_name` atau `kelas` (alias), dan boleh ditulis
    // sebagai "NamaKelas" atau "NamaKelas (Level)" supaya lebih mudah saat import manual.
    const kelasMap = new Map<string, (typeof kelasList)[number]>();
    for (const k of kelasList) {
      kelasMap.set(k.name.toLowerCase(), k);
      if (k.level_name) kelasMap.set(`${k.name} (${k.level_name})`.toLowerCase(), k);
      if (k.jenjang_name) kelasMap.set(`${k.name} (${k.jenjang_name})`.toLowerCase(), k);
    }

    const normalizeKey = (s: string) => s.trim().toLowerCase();

    for (const [index, record] of normalizedRecords.entries()) {
      const rowNum = index + 2; // +2 karena header di baris 1

      try {
        // Validasi required fields
        const missingFields = baseRequired.filter((f) => !record[f]);
        if (missingFields.length > 0) {
          result.failed++;
          result.errors.push(`Baris ${rowNum}: Field wajib hilang: ${missingFields.join(", ")}`);
          continue;
        }

        // Penempatan (Jenjang / Level / Kelas): minimal salah satu harus ada.
        const hasPlacement = placeFields.some((f) => record[f]);
        if (!hasPlacement) {
          result.failed++;
          result.errors.push(
            `Baris ${rowNum}: Isi minimal salah satu dari class_name (Jenjang), halaqah (Level), atau kelas_name (Kelas)`
          );
          continue;
        }

        // Cek NIS duplikat
        const existing = (await client.execute({ sql: "SELECT id FROM students WHERE nis = ?", args: [record.nis] })).rows[0] as unknown as { id: string } | undefined;
        if (existing) {
          result.failed++;
          result.errors.push(`Baris ${rowNum}: NIS ${record.nis} sudah terdaftar`);
          continue;
        }

        // Validate gender
        if (!["L", "P"].includes(record.gender.toUpperCase())) {
          result.failed++;
          result.errors.push(`Baris ${rowNum}: Gender harus L atau P`);
          continue;
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(record.birth_date)) {
          result.failed++;
          result.errors.push(`Baris ${rowNum}: Format birth_date harus YYYY-MM-DD`);
          continue;
        }

        // --- Lookup Kelas (bisa juga menjadi sumber Jenjang & Level) ---
        const kelasRaw = record.kelas_name || record.kelas || "";
        const kelas = kelasRaw ? kelasMap.get(normalizeKey(kelasRaw)) : undefined;
        if (kelasRaw && !kelas) {
          result.failed++;
          result.errors.push(`Baris ${rowNum}: Kelas "${kelasRaw}" tidak ditemukan di master data`);
          continue;
        }

        // --- Lookup Jenjang (classes) ---
        const classNameRaw = record.class_name || "";
        const classId =
          classMap.get(normalizeKey(classNameRaw)) ??
          (kelas?.jenjang_name ? classMap.get(normalizeKey(kelas.jenjang_name)) : undefined) ??
          record.class_id ??
          null;
        const className = classNameRaw || kelas?.jenjang_name || "";
        if (className && !classId) {
          result.failed++;
          result.errors.push(
            `Baris ${rowNum}: Jenjang "${className}" tidak ditemukan di master data`
          );
          continue;
        }

        // --- Lookup Level (halaqahs) ---
        const halaqahRaw = record.halaqah || record.halaqah_name || "";
        const halaqahId =
          halaqahMap.get(normalizeKey(halaqahRaw)) ??
          (kelas?.level_name ? halaqahMap.get(normalizeKey(kelas.level_name)) : undefined) ??
          (kelas?.level_id ?? undefined) ??
          record.halaqah_id ??
          null;
        if (halaqahRaw && !halaqahId) {
          result.failed++;
          result.errors.push(
            `Baris ${rowNum}: Level "${halaqahRaw}" tidak ditemukan di master data`
          );
          continue;
        }

        const kelasId = kelas?.id ?? record.kelas_id ?? null;
        const kelasName = kelas?.name ?? record.kelas_name ?? record.kelas ?? null;

        // Lookup academic_year_id
        const academicYearId = ayMap.get(normalizeKey(record.academic_year || record.academic_year_id || "")) ?? record.academic_year_id ?? null;

        // Generate ID
        const id = generateId("student");

        // Sanitize text fields
        const cleanAddress = sanitizeText(record.address);
        const cleanFatherName = sanitizeText(record.father_name);
        const cleanMotherName = sanitizeText(record.mother_name);
        const cleanGuardianName = sanitizeText(record.guardian_name);
        const cleanNotes = sanitizeText(record.notes);

        // Insert
        await client.execute({
          sql: `INSERT INTO students (
            id, nis, full_name, gender, birth_date, birth_place, address,
            class_id, class_name, halaqah_id, kelas_id, kelas_name,
            academic_year_id, enrollment_date,
            father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
          args: [
            id, record.nis, record.full_name, record.gender.toUpperCase(), record.birth_date, record.birth_place,
            cleanAddress ?? null, classId, className, halaqahId, kelasId, kelasName,
            academicYearId ?? null,
            record.enrollment_date ?? new Date().toISOString().split("T")[0],
            cleanFatherName ?? null, cleanMotherName ?? null, cleanGuardianName ?? null,
            record.guardian_phone ?? null, record.photo_url ?? null, cleanNotes ?? null
          ],
        });

        result.success++;
      } catch (err) {
        result.failed++;
        result.errors.push(`Baris ${rowNum}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Gagal memproses import" }, { status: 500 });
  }
}