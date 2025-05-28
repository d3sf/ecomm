'use client';

import React, { useState, useEffect } from "react";
// import { CategoryType } from "@/lib/zodvalidation";
// import HomeCategoryGrid from "@/components/category/HomeCategoryGrid";
// import { getCategories } from "@/lib/fetchcategories";
import HomepageSectionsDisplay from '@/components/HomepageSectionsDisplay';
import CategoryGridDisplay from '@/components/category/CategoryGridDisplay';
import { CategoryGridSkeleton, HomepageSectionsSkeleton } from '@/components/ui/SkeletonLoaders';
import Image from 'next/image';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

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
      {/* Welcome Section */}
      <div className="mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-3xl -z-10"></div>
        <div className="pt-18">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Text content */}
              <div className="text-left px-6 mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
                  <ShoppingBagIcon className="w-5 h-5" />
                  The Best Online Grocery Store
                </span>
                <h1 className="text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Your One Stop Shop for Quality Groceries
                  </span>
        </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  From fresh produce to household essentials, everything you need delivered to your home.
                </p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Shop Now
                  </button>
                  <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200">
                    Learn More
                  </button>
                </div>
              </div>
              
              {/* Right side - Image */}
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <div className="absolute bottom-0 w-full h-full">
                  <Image
                    src="/images/grocery-banner.png"
                    alt="Fresh groceries"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid Section
      <div className="mb-20">
        {loading ? (
          <p className="text-center">Loading categories...</p>
        ) : (
          <div className="relative">
            <HomeCategoryGrid categories={categories} />
          </div>
        )}
      </div> */}

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