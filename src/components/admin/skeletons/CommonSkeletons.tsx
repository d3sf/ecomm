'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseColor, highlightColor } from './config';

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Skeleton height={32} width="30%" baseColor={baseColor} highlightColor={highlightColor} />
      </div>
      
      {/* Table structure */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array(columns).fill(0).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Skeleton height={20} baseColor={baseColor} highlightColor={highlightColor} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array(rows).fill(0).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {Array(columns).fill(0).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                    <Skeleton height={20} baseColor={baseColor} highlightColor={highlightColor} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardSkeleton({ cards = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(cards).fill(0).map((_, i) => (
        <div key={i} className="bg-white shadow rounded-lg p-4">
          <Skeleton height={160} baseColor={baseColor} highlightColor={highlightColor} className="mb-4" />
          <Skeleton height={24} width="75%" baseColor={baseColor} highlightColor={highlightColor} className="mb-2" />
          <Skeleton height={16} width="50%" baseColor={baseColor} highlightColor={highlightColor} className="mb-4" />
          <Skeleton height={32} baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 6 }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Skeleton height={32} width="50%" baseColor={baseColor} highlightColor={highlightColor} className="mb-6" />
      
      <div className="space-y-4">
        {Array(fields).fill(0).map((_, i) => (
          <div key={i}>
            <Skeleton height={16} width="25%" baseColor={baseColor} highlightColor={highlightColor} className="mb-2" />
            <Skeleton height={40} baseColor={baseColor} highlightColor={highlightColor} />
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Skeleton height={40} width={100} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Skeleton height={32} width="50%" baseColor={baseColor} highlightColor={highlightColor} className="mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i}>
              <Skeleton height={16} width="33%" baseColor={baseColor} highlightColor={highlightColor} className="mb-1" />
              <Skeleton height={24} baseColor={baseColor} highlightColor={highlightColor} />
            </div>
          ))}
        </div>
        
        <Skeleton height={250} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
      
      <Skeleton height={150} baseColor={baseColor} highlightColor={highlightColor} className="mb-6" />
      
      <div className="flex justify-between">
        <Skeleton height={40} width={100} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton height={40} width={100} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
    </div>
  );
} 