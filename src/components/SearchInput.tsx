'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 1000); // 1 second debounce

  // Update URL with debounced search query
  useEffect(() => {
    if (debouncedSearchQuery !== searchParams.get('q')) {
      if (debouncedSearchQuery) {
        router.push(`/s?q=${encodeURIComponent(debouncedSearchQuery)}`);
      } else if (pathname === '/s') {
        // Only clear query if we're on the search page
        router.push('/s');
      }
    }
  }, [debouncedSearchQuery, router, pathname, searchParams]);

  // Update searchQuery when URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleFocus = () => {
    // Navigate to search page when clicked, only if not already there
    if (pathname !== '/s') {
      router.push('/s');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        onFocus={handleFocus}
        placeholder="Search for products..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {searchQuery && (
        <button
          onClick={() => {
            setSearchQuery('');
            router.push('/s');
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  );
} 