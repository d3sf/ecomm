'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseColor, highlightColor } from './config';
import { DashboardCardsSkeleton } from './DashboardCardsSkeleton';
import { BestSellingProductsSkeleton } from './BestSellingProductsSkeleton';

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton height={40} width={300} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton height={20} width={240} className="mt-2" baseColor={baseColor} highlightColor={highlightColor} />
        </div>
        
        {/* Order Statistics Cards Skeleton */}
        <div className="mb-8">
          <Skeleton height={24} width={200} className="mb-4" baseColor={baseColor} highlightColor={highlightColor} />
          <DashboardCardsSkeleton />
        </div>
        
        {/* Best Selling Products Chart Skeleton */}
        <div className="mb-8">
          <BestSellingProductsSkeleton />
        </div>
        
        {/* Recent Activity Section Skeleton */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <Skeleton height={24} width={200} className="mb-4" baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton count={3} className="mb-2" baseColor={baseColor} highlightColor={highlightColor} />
        </div>
        
        {/* Quick Links Section Skeleton */}
        <div className="bg-white shadow rounded-lg p-6">
          <Skeleton height={24} width={150} className="mb-4" baseColor={baseColor} highlightColor={highlightColor} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={60} className="rounded-lg" baseColor={baseColor} highlightColor={highlightColor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 