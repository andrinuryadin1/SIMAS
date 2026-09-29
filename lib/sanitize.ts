/**
 * lib/sanitize.ts
 * Sanitasi teks dan HTML ringan tanpa dependensi JSDOM / isomorphic-dompurify
 * agar 100% aman dan kompatibel dengan Vercel Serverless environment.
 */

const ALL_TAGS_REGEX = /<[^>]*>/g;
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const STYLE_REGEX = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;

// Tag formatting yang diizinkan untuk rich text
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "ul", "ol", "li",
  "/p", "/strong", "/em", "/u", "/ul", "/ol", "/li",
]);

/**
 * Sanitasi input teks bebas (strip semua HTML)
 * Gunakan untuk: description, note, actionTaken, dll.
 */
export function sanitizeText(input: string | null | undefined): string | null {
  if (!input) return null;
  return input
    .replace(SCRIPT_REGEX, "")
    .replace(STYLE_REGEX, "")
    .replace(ALL_TAGS_REGEX, "")
    .trim();
}

/**
 * Sanitasi input teks dengan formatting minimal (hanya p, br, strong, em, u, ul, ol, li)
 * Gunakan untuk: journal summary, reflection, dll.
 */
export function sanitizeRichText(input: string | null | undefined): string | null {
  if (!input) return null;
  let cleaned = input.replace(SCRIPT_REGEX, "").replace(STYLE_REGEX, "");
  cleaned = cleaned.replace(/<\/?([a-zA-Z0-9]+)[^>]*>/g, (match, tag) => {
    const isClosing = match.startsWith("</");
    const tagName = (isClosing ? "/" : "") + tag.toLowerCase();
    return ALLOWED_TAGS.has(tagName) ? `<${tagName}>` : "";
  });
  return cleaned.trim();
}

/**
 * Sanitasi title/heading (lebih ketat, max 200 karakter)
 */
export function sanitizeTitle(input: string | null | undefined): string | null {
  if (!input) return null;
  const stripped = sanitizeText(input);
  return stripped ? stripped.slice(0, 200) : null;
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