import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// NOTE: Prefer direct client uploads to Cloudinary to avoid Vercel body size limits.
// This route remains for compatibility, but may hit limits on large files.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'proposals';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

  // Validate file (server-side fallback). Client-side limit is 10MB.
  const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Format file tidak didukung. Hanya PDF yang diizinkan.'
      }, { status: 400 });
    }

  if (file.size > maxSize) {
      return NextResponse.json({
    error: 'Ukuran file terlalu besar. Maksimal 10MB.'
      }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary as an image resource so pg_1/f_jpg/w_* preview
    // transforms work later — "raw" only ever serves the file as-is.
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      format: 'pdf',
    });

    return NextResponse.json({
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at,
      }
    });

  } catch (error: any) {
    console.error('Error uploading PDF to Cloudinary:', error);
    return NextResponse.json({
      error: error.message || 'Failed to upload PDF'
    }, { status: 500 });
  }
}
