"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, Download, Upload } from "lucide-react";
import ProductList from "@/app/admin/products/components/ProductList";
import ProductForm from "@/app/admin/products/components/ProductForm";
import SlidingPanel from "@/components/admin/SlidingPanel";
import { ProductType, CategoryType } from "@/lib/zodvalidation";
import { ImportProgressDialog } from "@/components/admin/ImportProgressDialog";
import { TableSkeleton } from "@/components/admin/skeletons";
import SearchBar from "./components/SearchBar";
import { useDebounce } from '@/hooks/useDebounce';

// Custom hook for mount effect
const useMountEffect = (effect: () => void) => {
  useEffect(() => {
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductType | undefined>(undefined);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const isMounted = useRef(false);

  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [processedItems, setProcessedItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories?getAll=true");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  // Use useCallback to stabilize fetchProducts
  const fetchProducts = useCallback(async (page = currentPageRef.current) => {
    try {
      setIsLoading(true);
      currentPageRef.current = page;
      
      let url = `/api/products?page=${page}&limit=${itemsPerPage}`;
      
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      
      const response = await axios.get(url);
      setProducts(response.data.products);
      
      const { pagination } = response.data;
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.totalItems);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, itemsPerPage]);

  // Initial data loading
  useMountEffect(() => {
    fetchCategories();
    fetchProducts(currentPage);
    isMounted.current = true;
  });
  
  // Keep ref in sync with state
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  
  // Handle both page changes and search term changes
  useEffect(() => {
    // Skip the initial render - already handled by useMountEffect
    if (!isMounted.current) return;

    // Always fetch with current search term and page
    fetchProducts(currentPageRef.current);
  }, [currentPage, debouncedSearchTerm, fetchProducts]);

  const handleSubmit = async (product: ProductType) => {
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, product);
        toast.success("Product updated successfully");
      } else {
        await axios.post("/api/products", product);
        toast.success("Product created successfully");
      }
      setShowForm(false);
      setEditingProduct(undefined);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleTogglePublish = async (id: number, published: boolean) => {
    try {
      await axios.patch(`/api/products/${id}`, { published });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, published } : p));
      toast.success(`Product ${published ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      currentPageRef.current = page;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Reset to page 1 when search term changes
    setCurrentPage(1);
    currentPageRef.current = 1;
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/products/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      
      // Just trigger the download without showing any toast notification
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Failed to export products');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus("Starting import...");
    setProcessedItems(0);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      // Get the actual number of items from the API response
      const totalRows = data.totalRows || 0;
      setTotalItems(totalRows);
      
      // Update progress based on actual processed rows
      if (data.processedRows) {
        setProcessedItems(data.processedRows);
        setImportProgress((data.processedRows / totalRows) * 100);
        setImportStatus(`Processed ${data.processedRows} of ${totalRows} items`);
      }

      // Show success message with details
      const successMessage = data.success > 0 
        ? `Successfully imported ${data.success} products${data.failed > 0 ? `, ${data.failed} failed` : ''}`
        : 'No products were imported';
      toast.success(successMessage);

      // If there were any errors, show them
      if (data.errors && data.errors.length > 0) {
        console.error('Import errors:', data.errors);
      }

      // Refresh the product list with current pagination
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import products');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          {selectedProductIds.length > 0 && (
            <button
              onClick={() => {
                // Handle bulk actions here
                console.log("Selected product IDs:", selectedProductIds);
                // Example: could implement bulk delete, publish, etc.
              }}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Selected: {selectedProductIds.length}
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Upload size={20} />
            {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      {isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          categories={categories}
          onTogglePublish={handleTogglePublish}
          onSelectionChange={setSelectedProductIds}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      <SlidingPanel
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(undefined);
        }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        showUpdateButton={!!editingProduct}
        onUpdate={() => {
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }}
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          allCategories={categories}
        />
      </SlidingPanel>

      <ImportProgressDialog
        isOpen={isImporting}
        progress={importProgress}
        status={importStatus}
        totalItems={totalItems}
        processedItems={processedItems}
      />
    </div>
  );
};

export default ProductsPage;