'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Base theme settings
const baseColor = '#e2e8f0';  // Tailwind gray-200
const highlightColor = '#f8fafc';  // Tailwind gray-50

/**
 * Product Card Skeleton Loader
 */
export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md w-48">
      {/* Image placeholder */}
      <div className="h-[140px] w-[140px] mx-auto mt-4">
        <Skeleton height={140} width={140} baseColor={baseColor} highlightColor={highlightColor} />
      </div>

      {/* Content placeholders */}
      <div className="p-4">
        {/* Title */}
        <Skeleton count={1} height={16} width="75%" baseColor={baseColor} highlightColor={highlightColor} />
        <div className="mt-1 mb-3">
          <Skeleton count={1} height={16} width="50%" baseColor={baseColor} highlightColor={highlightColor} />
        </div>
        
        {/* Price and button */}
        <div className="flex justify-between items-center mt-2">
          <Skeleton height={16} width={40} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton circle height={32} width={32} baseColor={baseColor} highlightColor={highlightColor} />
        </div>
      </div>
    </div>
  );
}

/**
 * Product Carousel Skeleton Loader
 */
export function ProductCarouselSkeleton() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton height={32} width={200} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton height={24} width={64} baseColor={baseColor} highlightColor={highlightColor} />
      </div>

      {/* Products row */}
      <div className="flex space-x-8 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Category Grid Skeleton Loader
 */
export function CategoryGridSkeleton() {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-10 gap-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-[120px] w-full">
            <Skeleton 
              height="100%" 
              containerClassName="h-full w-full" 
              borderRadius={8}
              baseColor={baseColor} 
              highlightColor={highlightColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Homepage Sections Skeleton (multiple product carousels)
 */
export function HomepageSectionsSkeleton() {
  return (
    <div className="space-y-16">
      {[...Array(3)].map((_, i) => (
        <ProductCarouselSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product Detail Page Skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Left: Product Image Skeleton */}
        <div className="lg:col-span-1">
          <div className="aspect-square w-full">
            <Skeleton 
              height="100%" 
              containerClassName="h-full w-full" 
              borderRadius={8}
              baseColor={baseColor} 
              highlightColor={highlightColor}
            />
          </div>
          
          {/* Thumbnail images */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square w-full">
                <Skeleton 
                  height="100%" 
                  containerClassName="h-full w-full" 
                  borderRadius={6}
                  baseColor={baseColor} 
                  highlightColor={highlightColor}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Right: Product Info Skeleton */}
        <div className="mt-10 lg:mt-0 lg:col-span-1">
          {/* Title */}
          <Skeleton height={32} width="75%" baseColor={baseColor} highlightColor={highlightColor} />
          
          {/* Price */}
          <div className="mt-4 mb-6">
            <Skeleton height={24} width="25%" baseColor={baseColor} highlightColor={highlightColor} />
          </div>
          
          {/* Description lines */}
          <div className="space-y-3 mb-8">
            <Skeleton count={3} height={16} baseColor={baseColor} highlightColor={highlightColor} />
          </div>
          
          {/* Add to cart section */}
          <div className="mt-10">
            <Skeleton height={48} borderRadius={6} baseColor={baseColor} highlightColor={highlightColor} />
          </div>
        </div>
      </div>
    </div>
  );
} 