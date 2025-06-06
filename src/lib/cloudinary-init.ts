import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const REQUIRED_FOLDERS = [
  'merugo',
  'merugo/products',
  'merugo/categories',
  'merugo/banners',
  'merugo/users'
];

export async function initializeCloudinaryFolders() {
  try {
    for (const folder of REQUIRED_FOLDERS) {
      try {
        await cloudinary.v2.api.create_folder(folder);
        console.log(`Created folder: ${folder}`);
      } catch (error: any) {
        // Ignore if folder already exists
        if (!error.message?.includes('already exists')) {
          throw error;
        }
        console.log(`Folder already exists: ${folder}`);
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize Cloudinary folders:', error);
    return false;
  }
} 