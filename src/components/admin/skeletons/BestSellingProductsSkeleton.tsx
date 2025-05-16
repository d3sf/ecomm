'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseColor, highlightColor } from './config';

export function BestSellingProductsSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Skeleton height={32} width="40%" className="mb-4" baseColor={baseColor} highlightColor={highlightColor} />
      <Skeleton height={250} className="mb-5" baseColor={baseColor} highlightColor={highlightColor} />
      <Skeleton height={24} width="30%" className="mb-3" baseColor={baseColor} highlightColor={highlightColor} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center mb-3">
          <Skeleton circle width={48} height={48} className="mr-3" baseColor={baseColor} highlightColor={highlightColor} />
          <div className="flex-1">
            <Skeleton height={18} width="70%" className="mb-1" baseColor={baseColor} highlightColor={highlightColor} />
            <Skeleton height={16} width="40%" baseColor={baseColor} highlightColor={highlightColor} />
          </div>
        </div>
      ))}
    </div>
  );
} 