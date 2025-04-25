import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get('public_id');

  if (!publicId) {
    return NextResponse.json(
      { error: 'public_id is required' },
      { status: 400 }
    );
  }

  try {
    // Get resource details
    const result = await cloudinary.v2.api.resource(publicId);
    
    // Get folder from public_id
    const folderPath = publicId.includes('/') 
      ? publicId.substring(0, publicId.lastIndexOf('/')) 
      : '';
    
    // Check if the folder exists
    let folderExists = false;
    if (folderPath) {
      try {
        await cloudinary.v2.api.resource(folderPath, { resource_type: 'folder' });
        folderExists = true;
      } catch {
        folderExists = false;
      }
    }

    return NextResponse.json({
      success: true,
      resource: result,
      publicId,
      folderPath,
      folderExists
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource details' },
      { status: 500 }
    );
  }
} 