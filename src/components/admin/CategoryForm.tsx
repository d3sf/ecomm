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
    setFormData(category ? {
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      sortOrder: category.sortOrder || 0,
      published: category.published,
      image: category.image,
    } : defaultFormData);
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
      setFormData(defaultFormData); // Reset form after successful submission
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
      <div className="flex items-start gap-4">
        <label className="w-40 font-medium mt-2">Image</label>
        <div className="flex-1">
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
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Name<span className="text-red-500">*</span></label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Slug<span className="text-red-500">*</span></label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="flex items-start gap-4">
        <label className="w-40 font-medium mt-2">Parent Category</label>
        <div className="flex-1">
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
          <CategoryTreeSelect
            categories={filteredCategories}
            value={formData.parentId}
            onChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
            currentCategoryId={category?.id}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Sort Order</label>
        <input
          type="number"
          id="sortOrder"
          value={formData.sortOrder || 0}
          onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Published</label>
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

