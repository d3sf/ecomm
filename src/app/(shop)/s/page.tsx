'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: string;
  images: { url: string }[];
  slug: string;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  const fetchProducts = useCallback(async () => {
    if (!query || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
      const data = await response.json();
      
      if (data.products.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...data.products]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, isLoading, hasMore]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    if (query) {
      fetchProducts();
    }
  }, [query]);

  useEffect(() => {
    if (inView && hasMore) {
      fetchProducts();
    }
  }, [inView, hasMore, fetchProducts]);

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Matches Section */}
      {topProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Top Matches for &quot;{query}&quot;</h2>
          <div className="flex flex-wrap gap-4">
            {topProducts.map((product, index) => (
              <Link 
                href={`/product/${product.slug}`} 
                key={`top-${product.id}-${index}`} 
                className="flex items-center bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-10 h-10 mr-2">
                  <Image
                    src={product.images?.[0]?.url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <span className="text-sm font-medium">{product.name}</span>
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
            images={product.images}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          {isLoading && <div className="text-gray-500">Loading more products...</div>}
        </div>
      )}
    </div>
  );
} 