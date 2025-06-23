'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Search } from 'lucide-react';

export default function SearchInputContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 1000); // 1 second debounce
  const [isNavigatingHome, setIsNavigatingHome] = useState(false);
  const clearingSearch = useRef(false);

  // Update URL with debounced search query
  useEffect(() => {
    // Skip effect if we're navigating to the home page or clearing search
    if (isNavigatingHome || clearingSearch.current) return;
    
    if (debouncedSearchQuery !== searchParams.get('q')) {
      if (debouncedSearchQuery) {
        router.push(`/s?q=${encodeURIComponent(debouncedSearchQuery)}`);
      } else if (pathname === '/s') {
        // Only clear query if we're on the search page
        router.push('/s');
      }
    }
  }, [debouncedSearchQuery, router, pathname, searchParams, isNavigatingHome]);

  // Update searchQuery when URL changes
  useEffect(() => {
    // Reset navigating home flag when URL changes
    setIsNavigatingHome(false);
    
    // Only update search query if we're on the search page and not clearing search
    if (pathname === '/s' && !clearingSearch.current) {
      setSearchQuery(searchParams.get('q') || '');
    }
    
    // Reset clearing search flag
    if (clearingSearch.current) {
      clearingSearch.current = false;
    }
  }, [searchParams, pathname]);

  // Listen for pathname changes to reset state when navigating away from search
  useEffect(() => {
    if (pathname !== '/s') {
      setSearchQuery('');
    }
  }, [pathname]);

  const handleFocus = () => {
    // Navigate to search page when clicked, only if not already there
    if (pathname !== '/s') {
      router.push('/s');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    clearingSearch.current = true;
    setSearchQuery('');
    router.push('/s');
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        onFocus={handleFocus}
        placeholder="Search for products..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:shadow-md focus:shadow-gray-200"
      />
      {searchQuery && (
        <button
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  );
} 