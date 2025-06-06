'use client';

import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
// import { CategoryType } from "@/lib/zodvalidation";
// import HomeCategoryGrid from "@/components/category/HomeCategoryGrid";
// import { getCategories } from "@/lib/fetchcategories";
import { CategoryGridSkeleton, HomepageSectionsSkeleton } from '@/components/ui/SkeletonLoaders';
import MainBanner from '@/components/home/MainBanner';

// Lazy load components
const CategoryGridDisplay = lazy(() => import('@/components/category/CategoryGridDisplay'));
const HomepageSectionsDisplay = lazy(() => import('@/components/HomepageSectionsDisplay'));

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Simulate overall page loading with error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLoadingComplete();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [handleLoadingComplete]);

  // const [categories, setCategories] = useState<CategoryType[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function fetchCategories() {
  //     try {
  //       const categories = await getCategories();
  //       setCategories(categories);
  //     } catch (error) {
  //       console.error("Error loading categories:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchCategories();
  // }, []);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-8">
      {/* Main Banner Section */}
      <MainBanner />

      {/* Category Grid Display */}
      <Suspense fallback={<CategoryGridSkeleton />}>
        {isLoading ? (
          <CategoryGridSkeleton />
        ) : (
          <CategoryGridDisplay />
        )}
      </Suspense>

      {/* Product Listings Section */}
      <div className="mt-12">
        <Suspense fallback={<HomepageSectionsSkeleton />}>
          {isLoading ? (
            <HomepageSectionsSkeleton />
          ) : (
            <HomepageSectionsDisplay />
          )}
        </Suspense>
      </div>
    </main>
  );
}