import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { folder } = await request.json();

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    // Split the folder path and create each level
    const folders = folder.split('/');
    let currentPath = '';
    
    for (const folderName of folders) {
      if (!folderName) continue; // Skip empty segments
      
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      try {
        console.log(`Creating folder: ${currentPath}`);
        await cloudinary.v2.api.create_folder(currentPath);
      } catch (error: unknown) {
        const err = error as { error?: { message?: string } };
        // Ignore error if folder already exists
        if (err.error?.message?.includes('already exists')) {
          console.log(`Folder ${currentPath} already exists`);
          continue;
        }
        throw error;
      }
    }

    return NextResponse.json({ success: true, folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
} 