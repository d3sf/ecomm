'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: string;
  images: { url: string }[];
  slug: string;
  defaultImagePublicId?: string;
}

// Define a type for AbortError
interface FetchError extends Error {
  name: string;
}

export default function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!query || isLoading || !hasMore) return;

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&page=${page}`,
        { signal }
      );
      
      // Don't update state if the request was aborted
      if (signal.aborted) return;
      
      const data = await response.json();
      
      if (data.products.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...data.products]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      // Only log errors that aren't from aborting
      const fetchError = error as FetchError;
      if (fetchError.name !== 'AbortError') {
        console.error('Error fetching products:', error);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [query, page, isLoading, hasMore]);

  // Reset state when query changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(false);
  }, [query]);

  // Fetch products when page changes or query changes
  useEffect(() => {
    if (query && !isLoading && hasMore) {
      fetchProducts();
    }
  }, [query, page, fetchProducts]);

  // Load more products when scrolling to the bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchProducts();
    }
  }, [inView, hasMore, fetchProducts]);

  // Clean up any ongoing requests when unmounting
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!query) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search for products</h1>
        <p className="text-gray-600">Enter a search query to find products</p>
      </div>
    );
  }

  // Get the top 5 products for the top matches section
  const topProducts = products.slice(0, 5);

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      {/* Top Matches Section */}
      {topProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Top Matches for &quot;{query}&quot;</h2>
          <div className="flex flex-col gap-1">
            {topProducts.map((product, index) => (
              <Link 
                href={`/prdn/${product.slug}/prid/${product.id}`} 
                key={`top-${product.id}-${index}`} 
                className="flex items-center p-2"
              >
                <div className="relative w-12 h-12 mr-3">
                  <Image
                    src={product.images?.[0]?.url && typeof product.images[0].url === 'string' 
                      ? product.images[0].url 
                      : '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">
        Showing results for &quot;{query}&quot;
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={`${product.id}-${query}-${index}`}
            id={product.id}
            name={product.name}
            price={product.price}
            quantity={product.quantity}
            images={product.images?.filter(img => img?.url && typeof img.url === 'string')}
            defaultImagePublicId={product.defaultImagePublicId}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <LoadingSpinner size="md" color="primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 