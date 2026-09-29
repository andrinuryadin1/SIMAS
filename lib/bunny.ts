/**
 * Bunny CDN Helper untuk upload file (foto santri, dll.)
 * Gunakan BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_CDN_URL dari .env
 */

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY;
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL;

if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_API_KEY || !BUNNY_CDN_URL) {
  console.warn('Bunny CDN config not fully set. Upload will fail in production.');
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload file ke Bunny CDN Storage
 * @param file - File atau Buffer untuk diupload
 * @param path - Path tujuan di storage (contoh: 'students/photo/2024/001.jpg')
 * @returns Promise<UploadResult> - { success: true, url: 'https://...' } atau { success: false, error: '...' }
 */
export async function uploadToBunny(
  file: File | Buffer,
  path: string
): Promise<UploadResult> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_API_KEY || !BUNNY_CDN_URL) {
    return {
      success: false,
      error: 'Bunny CDN environment variables not configured',
    };
  }

  try {
    const url = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${path}`;
    
    const body = file instanceof File ? await file.arrayBuffer() : new Uint8Array(file.buffer);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_STORAGE_API_KEY,
        'Content-Type': file instanceof File ? file.type : 'application/octet-stream',
      },
      body: body as BodyInit,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bunny upload failed: ${response.status} ${errorText}`);
    }

    const cdnUrl = `${BUNNY_CDN_URL}/${path}`;
    return { success: true, url: cdnUrl };
  } catch (error) {
    console.error('Bunny CDN upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Delete file dari Bunny CDN Storage
 */
export async function deleteFromBunny(path: string): Promise<{ success: boolean; error?: string }> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_API_KEY) {
    return { success: false, error: 'Bunny CDN not configured' };
  }

  try {
    const url = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'AccessKey': BUNNY_STORAGE_API_KEY },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bunny delete failed: ${response.status} ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Bunny CDN delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error',
    };
  }
}

/**
 * Generate path untuk foto santri
 */
export function generateStudentPhotoPath(nis: string, extension: string): string {
  const year = new Date().getFullYear();
  return `students/photos/${year}/${nis}.${extension}`;
}

/**
 * Validasi file type dan size untuk foto santri
 */
export function validateStudentPhoto(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' };
  }

  return { valid: true };
}