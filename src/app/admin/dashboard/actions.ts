/**
 * Ensures the proper folder structure exists in Cloudinary
 * @returns Promise<boolean> - Success status
 */
export async function ensureCloudinaryFolders(): Promise<boolean> {
  try {
    await fetch('/api/cloudinary/setup-folders', {
      method: 'GET',
    });
    return true;
  } catch (error) {
    console.error('Error setting up Cloudinary folders:', error);
    return false;
  }
}

/**
 * Prepares the folder path for Cloudinary uploads
 * @param folder Base folder name (e.g., "products")
 * @returns Full folder path (e.g., "merugo/products")
 */
export function getCloudinaryFolder(folder: string): string {
  if (!folder) return 'merugo';
  if (folder.startsWith('merugo/')) return folder;
  if (folder === 'merugo') return folder;
  return `merugo/${folder}`;
} 