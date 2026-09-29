import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitasi HTML untuk mencegah XSS pada input teks bebas
 * Menggunakan DOMPurify dengan konfigurasi ketat
 */

// Konfigurasi default: hanya allow text, tidak ada HTML tags
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [], // Strip semua HTML tags
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

// Konfigurasi untuk field yang boleh minimal formatting (misal: journal summary)
const SANITIZE_CONFIG_LIGHT = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li"],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Sanitasi input teks bebas (strip semua HTML)
 * Gunakan untuk: description, note, actionTaken, dll.
 */
export function sanitizeText(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, SANITIZE_CONFIG).trim();
}

/**
 * Sanitasi input teks dengan formatting minimal
 * Gunakan untuk: journal summary, reflection, dll.
 */
export function sanitizeRichText(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, SANITIZE_CONFIG_LIGHT).trim();
}

/**
 * Sanitasi title/heading (lebih ketat)
 */
export function sanitizeTitle(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim().slice(0, 200);
}

/**
 * Middleware untuk sanitasi otomatis pada object data
 * Usage: const cleanData = sanitizeObject(data, { description: "text", summary: "rich" });
 */
export function sanitizeObject(
  data: Record<string, any>,
  fieldTypes: Partial<Record<string, "text" | "rich" | "title">>
): Record<string, any> {
  const result = { ...data };
  for (const [key, type] of Object.entries(fieldTypes)) {
    if (result[key] != null) {
      switch (type) {
        case "rich":
          result[key] = sanitizeRichText(result[key]);
          break;
        case "title":
          result[key] = sanitizeTitle(result[key]);
          break;
        case "text":
        default:
          result[key] = sanitizeText(result[key]);
          break;
      }
    }
  }
  return result;
}