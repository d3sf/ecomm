'use client';

import { Suspense } from 'react';
import SearchResultsContent from '@/components/search/SearchResultsContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
} 