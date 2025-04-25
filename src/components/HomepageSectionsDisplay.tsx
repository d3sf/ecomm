'use client';

import { useEffect, useState } from 'react';
import ProductCarousel from './ProductCarousel';

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
  category: Category;
}

export default function HomepageSectionsDisplay() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/homepage-sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative z-10">
      {sections
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => (
          <div key={section.id} className="mb-12">
            <ProductCarousel
              categoryName={section.category.name}
              products={section.category.products}
              categorySlug={section.category.slug}
            />
          </div>
        ))}
    </div>
  );
} 