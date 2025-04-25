'use client';

import React, { useEffect, useState } from "react";
import { CategoryType } from "@/lib/zodvalidation";
import HomeCategoryGrid from "@/components/category/HomeCategoryGrid";
import { getCategories } from "@/lib/fetchcategories";
import HomepageSectionsDisplay from '@/components/HomepageSectionsDisplay';

export default function Home() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const categories = await getCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">
          Welcome to Quick Shop
          <br />
          Store at your door
        </h1>
      </div>

      {/* Category Grid Section */}
      <div className="mb-20">
        {loading ? (
          <p className="text-center">Loading categories...</p>
        ) : (
          <div className="relative">
            <HomeCategoryGrid categories={categories} />
          </div>
        )}
      </div>

      {/* Product Listings Section */}
      <div className="mt-8 ">
        <HomepageSectionsDisplay />
      </div>
    </main>
  );
} 