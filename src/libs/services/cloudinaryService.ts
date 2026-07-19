// Cloudinary service for file uploads
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface CloudinaryUploadResponse {
  success: boolean;
  data?: CloudinaryUploadResult;
  error?: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

type UploadResult =
  | { success: true; data: CloudinaryUploadResult }
  | { success: false; error: string };

async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" | "raw" | "auto" = "auto",
): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return { success: false, error: "Cloudinary env tidak terkonfigurasi (CLOUD_NAME/UPLOAD_PRESET)." };
  }

  try {
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    if (folder) fd.append("folder", folder);

    const res = await fetch(endpoint, { method: "POST", body: fd });
    const ct = res.headers.get("content-type") || "";
    const raw = await res.text();
    const json = ct.includes("application/json") ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

    if (!res.ok) {
      if (res.status === 413) {
        return { success: false, error: "File terlalu besar (413). Perkecil ukuran atau kompres, batas 10MB di aplikasi." };
      }
      const msg = json?.error?.message || json?.message || raw?.slice(0, 200) || `Upload gagal (${res.status})`;
      return { success: false, error: msg };
    }

    if (json?.secure_url) {
      return { success: true, data: json as CloudinaryUploadResult };
    }
    return { success: false, error: "Respons upload tidak sesuai (tanpa secure_url)." };
  } catch (e: any) {
    return { success: false, error: e?.message || "Kesalahan jaringan saat upload" };
  }
}

export const cloudinaryService = {
  /**
   * Upload image file directly to Cloudinary
   */
  async uploadFile(file: File, folder: string = 'payment-proofs'): Promise<CloudinaryUploadResponse> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'File validation failed'
        };
      }
      const uploaded = await uploadToCloudinary(file, folder, "image");
      if (!uploaded.success) return { success: false, error: uploaded.error };
      return { success: true, data: uploaded.data };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }
  },

  /**
   * Upload PDF file to Cloudinary via API route for PDFs
   */
  async uploadPdf(file: File, folder: string = 'proposals'): Promise<CloudinaryUploadResponse> {
    try {
      const validation = this.validatePdf(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error || 'PDF validation failed' };
      }
      // resource_type "image": Cloudinary treats PDFs uploaded this way as a
      // paged image asset, which is what enables pg_1/f_jpg/w_* preview
      // transforms later. "raw" only ever serves the file byte-for-byte.
      const uploaded = await uploadToCloudinary(file, folder, "image");
      if (!uploaded.success) return { success: false, error: uploaded.error };
      return { success: true, data: uploaded.data };
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      return { success: false, error: error.message || 'Failed to upload PDF' };
    }
  },

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: For security, deletion should be done from backend
      // This is just a placeholder for future implementation
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting from Cloudinary:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get optimized image URL
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    let transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    const transformStr = transformations.length > 0 ? `${transformations.join(',')}` : '';
    
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
  },

  /**
   * Turn a Cloudinary PDF delivery URL into a JPG thumbnail of one page.
   * Works for both /image/upload/ URLs (new uploads) and older /raw/upload/
   * ones — Cloudinary renders the page as long as delivery goes through
   * the "image" resource type, regardless of what the URL said before.
   */
  getPdfPreviewUrl(pdfUrl: string, options: { page?: number; width?: number } = {}): string {
    const { page = 1, width = 600 } = options;
    return pdfUrl.replace(/\/(image|raw)\/upload\//, `/image/upload/pg_${page},f_jpg,w_${width}/`);
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.',
      };
    }

  if (file.size > maxSize) {
      return {
        isValid: false,
    error: 'Ukuran file terlalu besar. Maksimal 10MB.',
      };
    }

    return { isValid: true };
  },

  /**
   * Validate PDF before upload
   */
  validatePdf(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Format file tidak didukung. Hanya PDF.' };
    }
    if (file.size > maxSize) {
      return { isValid: false, error: 'Ukuran file terlalu besar. Maksimal 10MB.' };
    }
    return { isValid: true };
  },
};
