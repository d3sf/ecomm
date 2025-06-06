'use client';

import { useEffect } from 'react';

export function ClientInitializer() {
  useEffect(() => {
    // Any other client-side initialization can go here
  }, []);

  // This component doesn't render anything
  return null;
} 