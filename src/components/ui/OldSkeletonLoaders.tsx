'use client';

import React from 'react';

// Base skeleton pulse animation
const skeletonClass = "animate-pulse bg-gray-200 rounded";

/**
 * Product Card Skeleton Loader
 */
export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md w-48">
      {/* Image placeholder */}
      <div className={`${skeletonClass} h-[140px] w-[140px] mx-auto mt-4`}></div>

      {/* Content placeholders */}
      <div className="p-4">
        {/* Title */}
        <div className={`${skeletonClass} h-4 w-3/4 mb-2`}></div>
        <div className={`${skeletonClass} h-4 w-1/2 mb-4`}></div>
        
        {/* Price and button */}
        <div className="flex justify-between items-center mt-2">
          <div className={`${skeletonClass} h-4 w-1/3`}></div>
          <div className={`${skeletonClass} h-8 w-8 rounded-full`}></div>
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
        <div className={`${skeletonClass} h-8 w-1/4`}></div>
        <div className={`${skeletonClass} h-6 w-16`}></div>
      </div>

      {/* Products row */}
      <div className="flex space-x-8">
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
          <div key={i} className={`${skeletonClass} h-[120px] w-full rounded-lg`}></div>
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
          <div className={`${skeletonClass} aspect-square w-full rounded-lg`}></div>
          
          {/* Thumbnail images */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${skeletonClass} aspect-square w-full rounded-md`}></div>
            ))}
          </div>
        </div>
        
        {/* Right: Product Info Skeleton */}
        <div className="mt-10 lg:mt-0 lg:col-span-1">
          {/* Title */}
          <div className={`${skeletonClass} h-8 w-3/4 mb-4`}></div>
          
          {/* Price */}
          <div className={`${skeletonClass} h-6 w-1/4 mt-4 mb-6`}></div>
          
          {/* Description lines */}
          <div className="space-y-3 mb-8">
            <div className={`${skeletonClass} h-4 w-full`}></div>
            <div className={`${skeletonClass} h-4 w-full`}></div>
            <div className={`${skeletonClass} h-4 w-3/4`}></div>
          </div>
          
          {/* Add to cart section */}
          <div className="mt-10">
            <div className={`${skeletonClass} h-12 w-full rounded-md`}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 