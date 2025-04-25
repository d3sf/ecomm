import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

interface CloudinaryFolder {
  name: string;
  path: string;
}

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Create main folder first
    try {
      console.log('Creating main quickshop folder');
      await cloudinary.v2.api.create_folder('quickshop');
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } };
      if (!err.error?.message?.includes('already exists')) {
        throw error;
      }
      console.log('Main folder already exists');
    }

    // Create subfolders
    const subfolders = ['products', 'categories', 'banners', 'users'];
    
    for (const subfolder of subfolders) {
      try {
        console.log(`Creating subfolder: quickshop/${subfolder}`);
        await cloudinary.v2.api.create_folder(`quickshop/${subfolder}`);
      } catch (error: unknown) {
        const err = error as { error?: { message?: string } };
        if (!err.error?.message?.includes('already exists')) {
          throw error;
        }
        console.log(`Subfolder ${subfolder} already exists`);
      }
    }

    // List all folders to verify
    const result = await cloudinary.v2.api.root_folders();
    const quickshopFolder = result.folders.find((f: CloudinaryFolder) => f.name === 'quickshop');
    
    let subfoldersList = [];
    if (quickshopFolder) {
      const subfolderResult = await cloudinary.v2.api.sub_folders('quickshop');
      subfoldersList = subfolderResult.folders;
    }

    return NextResponse.json({ 
      success: true, 
      rootFolders: result.folders,
      quickshopSubfolders: subfoldersList
    });
  } catch (error) {
    console.error('Error setting up folders:', error);
    return NextResponse.json(
      { error: 'Failed to set up folders' },
      { status: 500 }
    );
  }
} 