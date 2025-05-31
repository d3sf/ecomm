'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CategoryGridSkeleton } from '@/components/ui/SkeletonLoaders';

interface CategoryGrid {
  id: string;
  categoryId: number;
  imageUrl: string;
  order: number;
  isVisible: boolean;
  category?: {
    name: string;
    slug: string;
  };
}

export default function CategoryGridDisplay() {
  const [categoryGrids, setCategoryGrids] = useState<CategoryGrid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryGrids();
  }, []);

  const fetchCategoryGrids = async () => {
    try {
      const response = await fetch('/api/category-grids/public');
      if (!response.ok) {
        throw new Error('Failed to fetch category grids');
      }
      const data = await response.json();
      setCategoryGrids(data);
    } catch (error) {
      console.error('Error fetching category grids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  const visibleGrids = categoryGrids.filter(grid => grid.isVisible);

  if (visibleGrids.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* <h2 className="text-2xl font-bold mb-6">Shop by Category</h2> */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
        {visibleGrids.map((grid) => (
          <Link
            key={grid.id}
            href={`/cn/${grid.category?.slug}/cid/${grid.categoryId}`}
            className="group"
          >
            <div className="relative rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-gray-400/50">
              <Image
                src={grid.imageUrl}
                alt={grid.category?.name || 'Category'}
                width={200}
                height={200}
                className="object-contain transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 