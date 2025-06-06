import { NextResponse } from 'next/server';
import { initializeCloudinaryFolders } from '@/lib/cloudinary-init';

// This route will be called when the server starts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cloudinaryResult = await initializeCloudinaryFolders();
    
    if (!cloudinaryResult) {
      throw new Error('Failed to initialize Cloudinary folders');
    }

    return NextResponse.json({
      success: true,
      message: 'Server initialized successfully'
    });
  } catch (error) {
    console.error('Server initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize server' },
      { status: 500 }
    );
  }
} 