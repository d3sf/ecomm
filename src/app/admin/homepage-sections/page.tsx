'use client';

import { useState, useEffect } from 'react';
import HomepageSectionsManager from '../components/HomepageSectionsManager';
import CategoryGridManager from '../components/CategoryGridManager';
import { HomepageSectionsSkeleton, CategoryGridSkeleton } from '@/components/admin/skeletons';

export default function HomepageSectionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <HomepageSectionsSkeleton />
        </div>
        
        <div>
          <CategoryGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Product Sections</h1>
        <HomepageSectionsManager />
      </div>
      
      <div>
        {/* <h1 className="text-2xl font-bold mb-6">Category Grids</h1> */}
        <CategoryGridManager />
      </div>
    </div>
  );
} 