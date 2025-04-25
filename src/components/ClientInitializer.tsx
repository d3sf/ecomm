'use client';

import { useEffect } from 'react';
import { ensureCloudinaryFolders } from '@/app/admin/dashboard/actions';

export function ClientInitializer() {
  useEffect(() => {
    // Setup Cloudinary folders when the app initializes
    ensureCloudinaryFolders()
      .then(() => console.log('Cloudinary folders setup complete'))
      .catch((error) => console.error('Error setting up Cloudinary folders:', error));
  }, []);

  // This component doesn't render anything
  return null;
} 