"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CategoryTree from '@/components/admin/CategoryTree';
import CategoryForm from '@/components/admin/CategoryForm';
import CategoryList from './components/CategoryList';
import SlidingPanel from '@/components/admin/SlidingPanel';
import { toast } from "react-hot-toast";
import { CategoryType } from '@/lib/zodvalidation';
import { Plus, ListTree, Trash2, Download, Upload } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { TableSkeleton } from '@/components/admin/skeletons';
import { useDebounce } from '@/hooks/useDebounce';

const CategoriesPage = () => {
  const pathname = usePathname();
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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const itemsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse URL path to determine current category path
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments.length > 2) { // More than just /admin/categories
        const categoryPath = pathSegments.slice(2); // Remove /admin/categories
        const categoryIds = categoryPath.map(id => parseInt(id)).filter(id => !isNaN(id));
        setCurrentPath(categoryIds);
        
        if (categoryIds.length > 0) {
          setCurrentParentId(categoryIds[categoryIds.length - 1]);
        }
      } else {
        setCurrentPath([]);
        setCurrentParentId(null);
      }
    }
  }, [pathname]);

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
      let url = "/api/admin/categories";
      const params = new URLSearchParams();
      
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
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
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
      
      setCategories(paginatedCategories); 
      setTotalItems(filteredCategories.length); 
      setTotalPages(Math.ceil(filteredCategories.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [currentParentId, currentPage, debouncedSearchTerm]);

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

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
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
    // Find the category to get its name
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${categoryToDelete.name}"?\n\n` +
      `This will also delete all subcategories and remove this category from all associated products.\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/admin/categories/${categoryId}`);
      if (response.status === 200) {
        toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
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
      const response = await axios.put(`/api/admin/categories/${categoryId}`, { published });
      if (response.status === 200) {
        toast.success(`Category ${published ? 'published' : 'unpublished'} successfully`);
        await fetchCategories();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error toggling category publish status:', error);
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to ${published ? 'publish' : 'unpublish'} category: ${error.response?.data?.error || 'Please try again later.'}`);
      } else {
        toast.error(`Failed to ${published ? 'publish' : 'unpublish'} category. Please try again later.`);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/categories/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'categories-export.csv';
      
      // Just trigger the download without showing any notification
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error exporting categories:', error);
      toast.error('Failed to export categories');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/categories/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result = await response.json();
      toast.success(
        `Import completed: ${result.results.created} created, ${result.results.updated} updated`
      );
      
      if (result.results.errors.length > 0) {
        toast.error(`${result.results.errors.length} errors occurred during import`);
        console.error('Import errors:', result.results.errors);
      }

      // Refresh the categories list
      await fetchCategories();
    } catch (error) {
      console.error('Error importing categories:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import categories');
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsTreeOpen(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <ListTree size={20} />
            View Category Tree
          </button>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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

      {/* Category Statistics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Categories</h3>
          <p className="text-2xl font-bold text-indigo-600">{allCategories.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Parent Categories</h3>
          <p className="text-2xl font-bold text-blue-600">
            {allCategories.filter(cat => !cat.parentId).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Subcategories</h3>
          <p className="text-2xl font-bold text-green-600">
            {allCategories.filter(cat => cat.parentId).length}
          </p>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="mb-4 flex flex-wrap items-center text-sm">
        {breadcrumbNames.map((name, index) => (
          <span key={index} className="text-sm text-gray-500">
            {name}
            {index < breadcrumbNames.length - 1 && ' / '}
          </span>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : (
        <DndProvider backend={HTML5Backend}>
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
            onSearch={handleSearch}
          />
        </DndProvider>
      )}

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
