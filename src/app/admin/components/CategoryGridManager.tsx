"use client";

import { useState, useEffect } from 'react';
import type { Category as PrismaCategory } from '@prisma/client';
import { Upload, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { CategoryGridSkeleton } from '@/components/admin/skeletons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category extends PrismaCategory {
  productCount?: number;
}

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

function SortableRow({ category, grid, onImageUpload, onToggleVisibility, onDelete, uploading, index }: {
  category: Category;
  grid?: CategoryGrid;
  onImageUpload: (categoryId: number, file: File) => void;
  onToggleVisibility: (gridId: string, currentVisibility: boolean) => void;
  onDelete: (gridId: string) => void;
  uploading: boolean;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-gray-200 ${isDragging ? 'bg-gray-50 shadow-lg' : ''}`}
    >
      <td className="px-4 py-2">
        {grid && (
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="text-gray-400" size={18} />
          </div>
        )}
      </td>
      <td className="px-4 py-2 text-gray-500">
        {index + 1}
      </td>
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
                    onImageUpload(category.id, file);
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
      <td className="px-4 py-2 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {category.productCount || 0}
        </span>
      </td>
      <td className="px-4 py-2">
        {grid && (
          <button
            onClick={() => onToggleVisibility(grid.id!, grid.isVisible)}
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
            onClick={() => onDelete(grid.id!)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Remove image"
          >
            <X size={18} />
          </button>
        )}
      </td>
    </tr>
  );
}

export default function CategoryGridManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryGrids, setCategoryGrids] = useState<CategoryGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'parent' | 'sub'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Update categories order
      setCategories((items) => {
        const oldIndex = items.findIndex((item: Category) => item.id.toString() === active.id);
        const newIndex = items.findIndex((item: Category) => item.id.toString() === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order in database
        fetch('/api/category-grids/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: newItems.map((item, index) => ({
              id: item.id,
              order: index,
            })),
          }),
        }).catch(error => {
          console.error('Error updating order:', error);
        });

        return newItems;
      });

      // Update categoryGrids order
      setCategoryGrids((grids) => {
        const oldIndex = grids.findIndex((grid: CategoryGrid) => grid.categoryId.toString() === active.id);
        const newIndex = grids.findIndex((grid: CategoryGrid) => grid.categoryId.toString() === over.id);
        const newGrids = arrayMove(grids, oldIndex, newIndex);
        
        // Update order numbers
        const updatedGrids = newGrids.map((grid, index) => ({
          ...grid,
          order: index + 1
        }));

        // Update order in the backend
        fetch('/api/category-grids/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grids: updatedGrids }),
        }).catch(error => {
          console.error('Error updating order:', error);
        });

        return updatedGrids;
      });
    }
  };

  // Filter categories based on the selected filter and search term
  const filteredCategories = categories.filter(category => {
    const matchesFilter = (() => {
      switch (categoryFilter) {
        case 'parent':
          return !category.parentId;
        case 'sub':
          return !!category.parentId;
        default:
          return true;
      }
    })();

    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sort categories based on grid order
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const gridA = categoryGrids.find(g => g.categoryId === a.id);
    const gridB = categoryGrids.find(g => g.categoryId === b.id);
    return (gridA?.order || 999) - (gridB?.order || 999);
  });

  // Calculate category counts
  const categoryCounts = {
    all: categories.length,
    parent: categories.filter(cat => !cat.parentId).length,
    sub: categories.filter(cat => !!cat.parentId).length
  };

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Grids</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories ({categoryCounts.all})
          </button>
          <button
            onClick={() => setCategoryFilter('parent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'parent'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Parent Categories Only ({categoryCounts.parent})
          </button>
          <button
            onClick={() => setCategoryFilter('sub')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'sub'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sub Categories Only ({categoryCounts.sub})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Categories List */}
      <div className="mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCategories.map(cat => cat.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2 w-10"></th>
                  <th className="px-4 py-2 w-16">Sr. No.</th>
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Category Name</th>
                  <th className="px-4 py-2 text-center">Products</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map((category, index) => {
                  const grid = categoryGrids.find(g => g.categoryId === category.id);
                  return (
                    <SortableRow
                      key={category.id}
                      category={category}
                      grid={grid}
                      onImageUpload={handleImageUpload}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDelete}
                      uploading={uploading}
                      index={index}
                    />
                  );
                })}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
} 