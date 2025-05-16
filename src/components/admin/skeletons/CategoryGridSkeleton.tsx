'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseColor, highlightColor } from './config';

export function CategoryGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton height={28} width={150} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(8)].map((_, index) => (
                <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    <Skeleton width={20} baseColor={baseColor} highlightColor={highlightColor} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton width={56} height={56} baseColor={baseColor} highlightColor={highlightColor} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    <Skeleton width={120} baseColor={baseColor} highlightColor={highlightColor} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton width={30} height={30} circle baseColor={baseColor} highlightColor={highlightColor} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Skeleton width={30} height={30} circle baseColor={baseColor} highlightColor={highlightColor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 