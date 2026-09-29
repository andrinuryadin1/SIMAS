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

    // Validasi required fields untuk setiap record
    const requiredFields = ["nis", "full_name", "gender", "birth_date", "birth_place", "class_name"];

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Pre-fetch classes dan halaqahs untuk lookup
    const client = createClient({ url: process.env.TURSO_DATABASE_URL || "file:data/simas.db", authToken: process.env.TURSO_AUTH_TOKEN });
    const classes = (await client.execute({ sql: "SELECT id, name FROM classes" })).rows as unknown as { id: string; name: string }[];
    const halaqahs = (await client.execute({ sql: "SELECT id, name FROM halaqahs" })).rows as unknown as { id: string; name: string }[];
    const academicYears = (await client.execute({ sql: "SELECT id, name FROM academic_years" })).rows as unknown as { id: string; name: string }[];

    const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c.id]));
    const halaqahMap = new Map(halaqahs.map((h) => [h.name.toLowerCase(), h.id]));
    const ayMap = new Map(academicYears.map((a) => [a.name.toLowerCase(), a.id]));

    for (const [index, record] of normalizedRecords.entries()) {
      const rowNum = index + 2; // +2 karena header di baris 1

      try {
        // Validasi required fields
        const missingFields = requiredFields.filter((f) => !record[f]);
        if (missingFields.length > 0) {
          result.failed++;
          result.errors.push(`Baris ${rowNum}: Field wajib hilang: ${missingFields.join(", ")}`);
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

        // Lookup class_id
        const classId = classMap.get(record.class_name.toLowerCase()) ?? record.class_id ?? null;
        const className = record.class_name;

        // Lookup halaqah_id
        const halaqahId = halaqahMap.get(record.halaqah?.toLowerCase() ?? record.halaqah_name?.toLowerCase() ?? "") ?? record.halaqah_id ?? null;

        // Lookup academic_year_id
        const academicYearId = ayMap.get(record.academic_year?.toLowerCase() ?? record.academic_year_id?.toLowerCase() ?? "") ?? record.academic_year_id ?? null;

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
            class_id, class_name, halaqah_id, academic_year_id, enrollment_date,
            father_name, mother_name, guardian_name, guardian_phone, photo_url, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
          args: [
            id, record.nis, record.full_name, record.gender.toUpperCase(), record.birth_date, record.birth_place,
            cleanAddress ?? null, classId ?? null, className, halaqahId ?? null, academicYearId ?? null,
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