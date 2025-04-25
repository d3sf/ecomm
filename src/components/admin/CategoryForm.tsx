'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryType } from '@/lib/zodvalidation';
import CategoryTreeSelect from './CategoryTreeSelect';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ImageUpload';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

interface CategoryFormProps {
  category?: CategoryType;
  categories: CategoryType[];
  onSubmit: (category: CategoryType) => void;
}

// Default empty form data
const defaultFormData = {
  name: '',
  slug: '',
  parentId: null,
  sortOrder: 0,
  published: true,
  image: undefined
};

const CategoryForm: React.FC<CategoryFormProps> = ({ category, categories, onSubmit }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CategoryType>>(defaultFormData);

  // Filter categories to prevent circular references
  const filteredCategories = categories.filter(cat =>
    !category || cat.id !== category.id
  );

  // Get parent category name
  const getParentCategoryName = () => {
    if (!formData.parentId) return 'None';
    const parent = categories.find(cat => cat.id === formData.parentId);
    return parent ? parent.name : 'None';
  };

  // Reset form when switching between edit and add modes
  useEffect(() => {
    if (category) {
      // Edit mode - load category data
      setFormData({
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        sortOrder: category.sortOrder || 0,
        published: category.published,
        image: category.image,
      });
    } else {
      // Add mode - reset to defaults
      setFormData({
        name: '',
        slug: '',
        parentId: null,
        sortOrder: 0,
        published: true,
        image: undefined
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Form data before submission:', formData);
      console.log('Image data:', formData.image);

      const updatedCategory = {
        ...formData,
        id: category?.id,
        image: formData.image || null,
      } as CategoryType;

      console.log('Final category data:', updatedCategory);

      onSubmit(updatedCategory);
      toast.success(category ? `Category "${updatedCategory.name}" updated successfully` : `Category "${updatedCategory.name}" created successfully`);
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error instanceof Error) {
        toast.error(`Failed to save category: ${error.message}`);
      } else {
        toast.error('Failed to save category. Please try again later.');
      }
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <ImageUpload
          images={formData.image ? [formData.image] : []}
          onChange={(images) => {
            console.log('Image upload onChange:', images);
            setFormData(prev => {
              const newData = { ...prev, image: images[0] };
              console.log('Updated formData:', newData);
              return newData;
            });
          }}
          label="Category Image"
          multiple={false}
          maxFiles={1}
          folder="categories"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <div className='grid'>
          <label className="block text-sm font-medium text-gray-700">
            Parent Category
          </label>
          {formData.parentId && (
            <div className="text-md mb-2 font-bold flex items-center justify-between">
              <span>
                SELECTED : 
                <span className='text-green-600 underline ml-1'>
                  {getParentCategoryName()}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, parentId: null }))}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Parent
              </button>
            </div>
          )}
        </div>
        <CategoryTreeSelect
          categories={filteredCategories}
          value={formData.parentId}
          onChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
          currentCategoryId={category?.id}
        />
      </div>

      <div>
        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
          Sort Order
        </label>
        <input
          type="number"
          id="sortOrder"
          value={formData.sortOrder || 0}
          onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <label htmlFor="published" className="block text-sm font-medium text-gray-700 mr-3">
          Published
        </label>
        <ToggleSwitch
          isOn={formData.published === true}
          onToggle={(val) => setFormData(prev => ({ ...prev, published: val }))}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {category ? 'Update' : 'Create'} Category
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 