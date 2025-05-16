'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseColor, highlightColor } from './config';

export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-md">
          <Skeleton height={20} width="50%" className="mb-3" baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={32} width="30%" baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      ))}
    </div>
  );
} 