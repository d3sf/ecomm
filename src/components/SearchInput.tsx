'use client';

import { Suspense } from 'react';
import SearchInputContent from '@/components/search/SearchInputContent';

export default function SearchInput() {
  return (
    <Suspense fallback={
      <div className="relative w-full">
        <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
          &nbsp;
        </div>
      </div>
    }>
      <SearchInputContent />
    </Suspense>
  );
} 