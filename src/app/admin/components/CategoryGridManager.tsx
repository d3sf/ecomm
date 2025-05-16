"use client";

import { useState, useEffect } from 'react';
import { Category } from '@prisma/client';
import { Upload, X, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { CategoryGridSkeleton } from '@/components/admin/skeletons';

interface CategoryGrid {
  id?: string;
  categoryId: number;
  imageUrl: string;
  order: number;
  isVisible: boolean;
}

interface CategoriesResponse {
  categories: Category[];
  totalCount: number;
  page: number;
  limit: number;
}

export default function CategoryGridManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryGrids, setCategoryGrids] = useState<CategoryGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCategoryGrids();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?getAll=true');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data: CategoriesResponse = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchCategoryGrids = async () => {
    try {
      const response = await fetch('/api/category-grids');
      if (!response.ok) {
        throw new Error('Failed to fetch category grids');
      }
      const data = await response.json();
      setCategoryGrids(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category grids:', error);
      setCategoryGrids([]);
      setLoading(false);
    }
  };

  const handleImageUpload = async (categoryId: number, file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('categoryId', categoryId.toString());

      const response = await fetch('/api/upload/category-grid', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setCategoryGrids(prev => [...prev, data]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (gridId: string) => {
    try {
      const response = await fetch(`/api/category-grids/${gridId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setCategoryGrids(prev => prev.filter(grid => grid.id !== gridId));
    } catch (error) {
      console.error('Error deleting category grid:', error);
    }
  };

  const handleToggleVisibility = async (gridId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/category-grids/${gridId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Toggle visibility failed');
      }

      setCategoryGrids(prev =>
        prev.map(grid =>
          grid.id === gridId ? { ...grid, isVisible: !currentVisibility } : grid
        )
      );
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Grids</h2>
      </div>

      {/* Categories List */}
      <div className="mt-4">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Category Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              const grid = categoryGrids.find(g => g.categoryId === category.id);
              return (
                <tr key={category.id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-2">
                    <div className="w-14 h-14 relative">
                      {grid ? (
                        <Image
                          src={grid.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <label className="block w-full h-full">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(category.id, file);
                              }
                            }}
                            disabled={uploading}
                          />
                          <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                            <Upload size={20} />
                          </div>
                        </label>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{category.name}</td>
                  <td className="px-4 py-2">
                    {grid && (
                      <button
                        onClick={() => handleToggleVisibility(grid.id!, grid.isVisible)}
                        className={`p-2 rounded ${
                          grid.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title={grid.isVisible ? 'Hide from grid' : 'Show in grid'}
                      >
                        {grid.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {grid && (
                      <button
                        onClick={() => handleDelete(grid.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Remove image"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 