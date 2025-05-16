'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseColor, highlightColor } from './config';

export function HomepageSectionsSkeleton() {
  return (
    <div className="p-6">
      <Skeleton height={40} width={300} className="mb-6" baseColor={baseColor} highlightColor={highlightColor} />
      
      {/* Add New Section Form Skeleton */}
      <div className="mb-8">
        <div className="flex gap-4">
          <Skeleton height={40} width="100%" baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={40} width={120} baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      </div>
      
      {/* Sections List Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={60} className="rounded-lg" baseColor={baseColor} highlightColor={highlightColor} />
        ))}
      </div>
    </div>
  );
} 