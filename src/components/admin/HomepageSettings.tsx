'use client';

import React, { useState, useEffect } from 'react';
import { CategoryType } from '@/lib/zodvalidation';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HomepageSection {
  id: number;
  name: string;
  type: 'category';
  categoryId: number;
  sortOrder: number;
  isActive: boolean;
  category?: CategoryType;
}

interface HomepageSettingsProps {
  categories: CategoryType[];
}

const HomepageSettings: React.FC<HomepageSettingsProps> = ({ categories }) => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/homepage-sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load homepage sections');
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    try {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'category',
          categoryId: selectedCategory,
          sortOrder: sections.length,
        }),
      });

      if (!response.ok) throw new Error('Failed to add section');

      const newSection = await response.json();
      setSections([...sections, newSection]);
      setSelectedCategory(null);
      toast.success('Section added successfully');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  const removeSection = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove section');

      setSections(sections.filter(section => section.id !== id));
      toast.success('Section removed successfully');
    } catch (error) {
      console.error('Error removing section:', error);
      toast.error('Failed to remove section');
    }
  };

  const updateSortOrder = async (id: number, newSortOrder: number) => {
    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sortOrder: newSortOrder }),
      });

      if (!response.ok) throw new Error('Failed to update sort order');

      setSections(sections.map(section =>
        section.id === id ? { ...section, sortOrder: newSortOrder } : section
      ));
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast.error('Failed to update sort order');
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Homepage Sections</h2>
        
        {/* Add New Section */}
        <div className="flex items-center gap-4 mb-6">
          <select
            className="flex-1 p-2 border rounded"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={addSection}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSortOrder(section.id, section.sortOrder - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-gray-500">{section.sortOrder + 1}</span>
                  <button
                    onClick={() => updateSortOrder(section.id, section.sortOrder + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {section.category?.name || 'Unknown Category'}
                  </h3>
                </div>
                <button
                  onClick={() => removeSection(section.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomepageSettings; 