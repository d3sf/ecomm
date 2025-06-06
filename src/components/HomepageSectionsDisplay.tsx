'use client';

import { useEffect, useState } from 'react';
import ProductCarousel from './ProductCarousel';
import { HomepageSectionsSkeleton } from '@/components/ui/SkeletonLoaders';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  products: Product[];
}

interface HomepageSection {
  id: number;
  name: string;
  type: string;
  categoryId: number;
  sortOrder: number;
  isActive: boolean;
  category?: Category;
}

export default function HomepageSectionsDisplay() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/homepage-sections');
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
        setError('Failed to load sections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, []);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <HomepageSectionsSkeleton />;
  }

  return (
    <div className="relative z-10">
      {sections
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => (
          <div key={section.id} className="mb-12">
            {section.category && (
              <ProductCarousel
                categoryName={section.category.name}
                products={section.category.products}
                categorySlug={section.category.slug}
                categoryId={section.category.id}
              />
            )}
          </div>
        ))}
    </div>
  );
} 