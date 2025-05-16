'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ProductCardSkeleton, 
  ProductCarouselSkeleton,
  CategoryGridSkeleton,
  HomepageSectionsSkeleton,
  ProductDetailSkeleton 
} from '@/components/ui/SkeletonLoaders';

export default function SkeletonDemoPage() {
  const [activeTab, setActiveTab] = useState<string>('product-card');

  const tabs = [
    { id: 'product-card', label: 'Product Card' },
    { id: 'product-carousel', label: 'Product Carousel' },
    { id: 'category-grid', label: 'Category Grid' },
    { id: 'homepage', label: 'Homepage' },
    { id: 'product-detail', label: 'Product Detail' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex items-center mb-4">
        <Link href="/demos" className="text-indigo-600 hover:text-indigo-800 mr-4">
          &larr; Back to Demos
        </Link>
        <h1 className="text-3xl font-bold">Skeleton Loader Demo</h1>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="mt-8">
        {activeTab === 'product-card' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Card Skeleton</h2>
            <div className="flex space-x-4">
              <ProductCardSkeleton />
            </div>
          </div>
        )}
        
        {activeTab === 'product-carousel' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Carousel Skeleton</h2>
            <ProductCarouselSkeleton />
          </div>
        )}
        
        {activeTab === 'category-grid' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Category Grid Skeleton</h2>
            <CategoryGridSkeleton />
          </div>
        )}
        
        {activeTab === 'homepage' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Homepage Sections Skeleton</h2>
            <HomepageSectionsSkeleton />
          </div>
        )}
        
        {activeTab === 'product-detail' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Detail Skeleton</h2>
            <ProductDetailSkeleton />
          </div>
        )}
      </div>
    </div>
  );
} 