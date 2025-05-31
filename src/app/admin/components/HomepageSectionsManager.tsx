'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@prisma/client';
import { HomepageSectionsSkeleton } from '@/components/admin/skeletons';

interface HomepageSection {
  id: number;
  name: string;
  type: string;
  categoryId: number;
  sortOrder: number;
  isActive: boolean;
  category?: Category;
}

export default function HomepageSectionsManager() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/homepage-sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'category',
          categoryId: selectedCategory,
        }),
      });

      if (response.ok) {
        const newSection = await response.json();
        setSections([...sections, newSection]);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleDeleteSection = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(sections.filter(section => section.id !== id));
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleMoveSection = async (id: number, direction: 'up' | 'down') => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const currentIndex = sections.findIndex((s: HomepageSection) => s.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sections.length) return;

    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sortOrder: newIndex,
        }),
      });

      if (response.ok) {
        const newSections = [...sections];
        const [movedSection] = newSections.splice(currentIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        const updatedSections = newSections.map((section, index) => ({
          ...section,
          sortOrder: index,
        }));
        setSections(updatedSections);
      }
    } catch (error) {
      console.error('Error moving section:', error);
    }
  };

  if (isLoading) {
    return <HomepageSectionsSkeleton />;
  }

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Manage Homepage Sections</h1> */}
      <h1 className="text-2xl font-bold mb-6">Product Sections</h1>
      {/* Add New Section Form */}  
      <form onSubmit={handleAddSection} className="mb-8">
        <div className="flex gap-4">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={!selectedCategory}
          >
            Add Section
          </button>
        </div>
      </form>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleMoveSection(section.id, 'up')}
                  disabled={index === 0}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveSection(section.id, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  ↓
                </button>
              </div>
              <span className="font-medium">
                {section.category?.name || 'Unknown Category'}
              </span>
            </div>
            <button
              onClick={() => handleDeleteSection(section.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 