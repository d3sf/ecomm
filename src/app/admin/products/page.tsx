"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";
import ProductList from "@/app/admin/products/components/ProductList";
import ProductForm from "@/app/admin/products/components/ProductForm";
import SlidingPanel from "@/components/admin/SlidingPanel";
import { ProductType, CategoryType } from "@/lib/zodvalidation";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const isMounted = useRef(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  // Use useCallback to stabilize fetchProducts
  const fetchProducts = useCallback(async (page = currentPageRef.current) => {
    try {
      currentPageRef.current = page;
      
      let url = `/api/products?page=${page}&limit=${itemsPerPage}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await axios.get(url);
      setProducts(response.data.products);
      
      const { pagination } = response.data;
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.totalItems);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  }, [searchTerm, itemsPerPage]);

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

    if (searchTerm) {
      // When search term changes, reset to page 1
      setCurrentPage(1);
      fetchProducts(1);
    } else {
      // When only page changes
      fetchProducts(currentPage);
    }
  }, [currentPage, searchTerm, fetchProducts]);

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
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // We don't set currentPage here - it's handled in the effect
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
        onSearch={handleSearch}
      />

      <SlidingPanel
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(undefined);
        }}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          allCategories={categories}
        />
      </SlidingPanel>
    </div>
  );
};

export default ProductsPage;