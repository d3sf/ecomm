"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CategoryTree from '@/components/admin/CategoryTree';
import CategoryForm from '@/components/admin/CategoryForm';
import CategoryList from '../components/CategoryList';
import SlidingPanel from '@/components/admin/SlidingPanel';
import { toast } from "react-hot-toast";
import { CategoryType } from '@/lib/zodvalidation';
import { Plus, ListTree, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CategoriesPage = () => {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | undefined>(undefined);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [breadcrumbNames, setBreadcrumbNames] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Parse URL path to determine current category path
  useEffect(() => {
    if (params?.path) {
      const pathArray = Array.isArray(params.path) ? params.path : [params.path];
      const categoryIds = pathArray.map(id => parseInt(id)).filter(id => !isNaN(id));
      setCurrentPath(categoryIds);
      
      if (categoryIds.length > 0) {
        setCurrentParentId(categoryIds[categoryIds.length - 1]);
      } else {
        setCurrentParentId(null);
      }
    } else {
      setCurrentPath([]);
      setCurrentParentId(null);
    }
  }, [params]);

  // Update breadcrumb names when categories or path changes
  useEffect(() => {
    const names = currentPath.map(id => {
      const category = allCategories.find(cat => cat.id === id);
      return category?.name || '';
    }).filter(Boolean);
    setBreadcrumbNames(names);
  }, [currentPath, allCategories]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/categories");
      if (!response.data) {
        console.error("Invalid API response structure:", response);
        toast.error("Failed to load categories: Invalid response format");
        return;
      }
      
      const allCategories = response.data;
      setAllCategories(allCategories);
      
      // Filter categories based on current parent ID
      const filteredCategories = currentParentId
        ? allCategories.filter((cat: CategoryType) => cat.parentId === currentParentId)
        : allCategories.filter((cat: CategoryType) => !cat.parentId);
      
      setCategories(filteredCategories);
      setTotalItems(filteredCategories.length);
      setTotalPages(Math.ceil(filteredCategories.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [currentParentId, itemsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePathChange = (newPath: number[]) => {
    setCurrentPath(newPath);
    if (newPath.length === 0) {
      setCurrentParentId(null);
      router.push('/admin/categories');
    } else {
      setCurrentParentId(newPath[newPath.length - 1]);
      const pathString = newPath.join('/');
      router.push(`/admin/categories/${pathString}`);
    }
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setIsAddFormOpen(true);
  };
  
  const handleCategoryUpdate = async (updatedCategory: CategoryType) => {
    try {
      let response;
      if (updatedCategory.id) {
        console.log('Updating category:', updatedCategory);
        response = await axios.put(`/api/admin/categories/${updatedCategory.id}`, updatedCategory);
        toast.success(`Category "${updatedCategory.name}" updated successfully`);
      } else {
        console.log('Creating new category:', updatedCategory);
        response = await axios.post("/api/admin/categories", updatedCategory);
        if (!response.data) {
          throw new Error("Invalid response from server");
        }
        toast.success(`Category "${updatedCategory.name}" created successfully`);
      }
      await fetchCategories();
      setSelectedCategory(undefined);
      setIsAddFormOpen(false);
    } catch (error) {
      console.error('Error updating category:', error);
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.error || "Failed to update category"
        : "Failed to update category";
        
      if (error instanceof AxiosError && error.response?.data?.details) {
        console.error('Validation details:', error.response.data.details);
        const details = error.response.data.details;
        if (details.fieldErrors) {
          const errorFields = Object.entries(details.fieldErrors)
            .map(([field, errors]) => `${field}: ${errors}`)
            .join(', ');
          toast.error(`Validation error: ${errorFields}`);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCategoryDelete = async (categoryId: number) => {
    try {
      const response = await axios.delete(`/api/admin/categories/${categoryId}`);
      if (response.status === 200) {
        toast.success("Category deleted successfully");
        await fetchCategories();
        setSelectedCategory(undefined);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error("Category not found. The category may have been already deleted.");
          await fetchCategories();
        } else {
          toast.error(`Failed to delete category: ${error.response?.data?.error || 'Please try again later.'}`);
        }
      } else {
        toast.error("Failed to delete category. Please try again later.");
      }
    }
  };

  const handleBulkDelete = async (categoryIds: number[]) => {
    try {
      await Promise.all(categoryIds.map(id => axios.delete(`/api/admin/categories/${id}`)));
      toast.success(`${categoryIds.length} categories deleted successfully`);
      await fetchCategories();
      setSelectedCategory(undefined);
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast.error("Failed to delete categories. Please try again later.");
    }
  };

  const handleTogglePublish = async (categoryId: number, published: boolean) => {
    try {
      console.log('Toggling published status to:', published, 'for category ID:', categoryId);
      
      // Use a simple approach - just update the published field
      // We'll use our CategoryUpdateSchema which allows partial updates
      const response = await axios.put(`/api/admin/categories/${categoryId}`, {
        published: published
      });

      console.log('Update response:', response.data);
      
      if (response.status === 200) {
        toast.success(`Category ${published ? 'published' : 'unpublished'} successfully`);
        await fetchCategories();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error toggling category publish status:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response data:', error.response?.data);
        toast.error(`Failed to ${published ? 'publish' : 'unpublish'} category: ${error.response?.data?.error || 'Please try again later.'}`);
      } else {
        toast.error(`Failed to ${published ? 'publish' : 'unpublish'} category. Please try again later.`);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md">
          <button
            onClick={() => setIsTreeOpen(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <ListTree size={20} />
            View Category Tree
          </button>
          <button
            onClick={() => {
              setSelectedCategory(undefined);
              setIsAddFormOpen(true);
            }}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus size={20} />
            Add Category
          </button>
          <button
            onClick={() => handleBulkDelete(selectedCategoryIds)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedCategoryIds.length === 0}
          >
            <Trash2 size={20} />
            Delete Selected
          </button>
        </div>
      </div>

      <CategoryList
        categories={categories}
        allCategories={allCategories}
        onTogglePublish={handleTogglePublish}
        onDelete={handleCategoryDelete}
        onEdit={handleCategorySelect}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onSelectionChange={setSelectedCategoryIds}
        currentPath={currentPath}
        onPathChange={handlePathChange}
        breadcrumbNames={breadcrumbNames}
        onSearch={() => {}}
      />

      {/* Category Tree Sliding Panel */}
      <SlidingPanel
        isOpen={isTreeOpen}
        onClose={() => setIsTreeOpen(false)}
        title="Category Tree"
      >
        <DndProvider backend={HTML5Backend}>
          <CategoryTree
            categories={allCategories}
            onSelect={handleCategorySelect}
            onDelete={handleCategoryDelete}
          />
        </DndProvider>
      </SlidingPanel>

      {/* Add/Edit Category Sliding Panel */}
      <SlidingPanel
        isOpen={isAddFormOpen}
        onClose={() => {
          setIsAddFormOpen(false);
          setSelectedCategory(undefined);
        }}
        title={selectedCategory ? 'Edit Category' : 'Add New Category'}
      >
        <CategoryForm
          category={selectedCategory}
          categories={allCategories}
          onSubmit={handleCategoryUpdate}
        />
      </SlidingPanel>
    </div>
  );
};

export default CategoriesPage; 