'use client';

import React, { useState, useEffect } from "react";
// import { CategoryType } from "@/lib/zodvalidation";
// import HomeCategoryGrid from "@/components/category/HomeCategoryGrid";
// import { getCategories } from "@/lib/fetchcategories";
import HomepageSectionsDisplay from '@/components/HomepageSectionsDisplay';
import CategoryGridDisplay from '@/components/category/CategoryGridDisplay';
import { CategoryGridSkeleton, HomepageSectionsSkeleton } from '@/components/ui/SkeletonLoaders';
import MainBanner from '@/components/home/MainBanner';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate overall page loading
  useEffect(() => {
    // Allow components to load naturally but ensure minimum loading time for UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-8">
      {/* Main Banner Section */}
      <MainBanner />

      {/* Category Grid Display */}
      {isLoading ? (
        <CategoryGridSkeleton />
      ) : (
        <CategoryGridDisplay />
      )}

      {/* Product Listings Section */}
      <div className="mt-12">
        {isLoading ? (
          <HomepageSectionsSkeleton />
        ) : (
          <HomepageSectionsDisplay />
        )}
      </div>
    </main>
  );
}