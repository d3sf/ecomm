"use client";

import { useState, useEffect } from 'react';
import { ProductType } from '@/lib/zodvalidation';
import ProductCard from './ProductCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Base theme settings
const baseColor = '#e2e8f0';  // Tailwind gray-200
const highlightColor = '#f8fafc';  // Tailwind gray-50

interface RelatedProductsProps {
  currentProductId: number;
  categoryId?: number;
}

export default function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsPerView, setProductsPerView] = useState(6);

  // Update products per view based on screen size
  useEffect(() => {
    const updateProductsPerView = () => {
      const width = window.innerWidth;
      if (width < 1024) setProductsPerView(3); // Mobile and tablets
      else setProductsPerView(6); // Larger screens
    };
    
    // Initial update
    updateProductsPerView();
    
    // Add resize event listener
    window.addEventListener('resize', updateProductsPerView);
    
    // Cleanup function
    return () => window.removeEventListener('resize', updateProductsPerView);
  }, []);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;
      
      try {
        const response = await fetch(`/api/products/related?categoryId=${categoryId}&currentProductId=${currentProductId}&limit=${productsPerView}`);
        if (!response.ok) throw new Error('Failed to fetch related products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId, productsPerView]);

  if (!categoryId || loading) {
    return (
      <div className="mt-12">
        <Skeleton height={32} width={200} className="mb-6" baseColor={baseColor} highlightColor={highlightColor} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(productsPerView)].map((_, index) => (
            <div key={index} className="border border-gray-300 rounded-lg overflow-hidden shadow-md">
              <div className="h-[140px] w-[140px] mx-auto mt-4">
                <Skeleton height={140} width={140} baseColor={baseColor} highlightColor={highlightColor} />
              </div>
              <div className="p-4">
                <Skeleton count={1} height={16} width="75%" baseColor={baseColor} highlightColor={highlightColor} />
                <div className="mt-1 mb-3">
                  <Skeleton count={1} height={16} width="50%" baseColor={baseColor} highlightColor={highlightColor} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <Skeleton height={16} width={40} baseColor={baseColor} highlightColor={highlightColor} />
                  <Skeleton circle height={32} width={32} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            quantity={product.quantity}
            images={product.images?.map(img => ({
              url: img.url || '/placeholder.png',
              publicId: img.publicId
            })) || []}
          />
        ))}
      </div>
    </div>
  );
} 