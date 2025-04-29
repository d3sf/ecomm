'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

interface ProductImage {
  url?: string;
  publicId?: string;
  [key: string]: string | undefined;
}

interface Product {
  id: number;
  name: string;
  price: number;
  images: ProductImage | ProductImage[] | string[] | null;
  slug: string;
  quantity?: string; // Added to match ProductCard expectations
  defaultImagePublicId?: string;
}

interface ProductCarouselProps {
  categoryName: string;
  products: Product[];
  categorySlug: string;
}

export default function ProductCarousel({ categoryName, products, categorySlug }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productsPerView, setProductsPerView] = useState(6);

  // Update products per view based on screen size
  const updateProductsPerView = () => {
    const width = window.innerWidth;
    if (width < 1024) setProductsPerView(3); // Mobile and tablets
    else setProductsPerView(6); // Larger screens
  };

  // Add event listener for window resize
  useState(() => {
    updateProductsPerView();
    window.addEventListener('resize', updateProductsPerView);
    return () => window.removeEventListener('resize', updateProductsPerView);
  });

  const nextSlide = () => {
    if (currentIndex + productsPerView < products.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Convert various image formats to the format expected by ProductCard
  const formatImages = (images: Product['images']): { url: string; publicId?: string }[] => {
    if (!images) return [{ url: '/placeholder.png' }];
    
    // If images is an array (either string[] or ProductImage[])
    if (Array.isArray(images)) {
      return images.map(img => {
        if (typeof img === 'string') return { url: img };
        return { 
          url: img?.url || '/placeholder.png',
          publicId: img?.publicId
        };
      });
    }
    
    // If images is a single ProductImage object
    if (typeof images === 'object') {
      if (images.url) return [{ url: images.url, publicId: images.publicId }];
      // Check for numbered keys
      const firstKey = Object.keys(images)[0];
      return [{ url: images[firstKey] || '/placeholder.png' }];
    }

    return [{ url: '/placeholder.png' }];
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{categoryName}</h2>
        <Link 
          href={`/category/${categorySlug}`}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          See All
        </Link>
      </div>

      <div className="relative w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {visibleProducts.map((product) => (
            <div key={product.id} className="w-full p-2">
              <ProductCard
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: product.quantity || '1 pc',
                  images: formatImages(product.images),
                  slug: product.slug,
                  defaultImagePublicId: product.defaultImagePublicId
                }}
              />
            </div>
          ))}
        </div>

        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {currentIndex + productsPerView < products.length && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}