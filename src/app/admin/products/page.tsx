"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import type { ProductType, CategoryType } from "@/lib/zodvalidation";
import { toast } from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import SlidingPanel from "@/components/admin/SlidingPanel";

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

  const [currentPage, /* setCurrentPage */] = useState(1);
  const [/* totalPages */, setTotalPages] = useState(1);
  const [/* totalItems */, setTotalItems] = useState<number>(0);
  const itemsPerPage = 10;

  // Keep track of selected products
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      if (!response.data) {
        console.error("Invalid API response structure:", response);
        return;
      }
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log("Fetching products, page:", currentPage);
      const response = await axios.get("/api/products", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          includeDefaultCategory: true
        },
      });
      
      if (!response.data) {
        console.error("Invalid API response structure:", response);
        return;
      }

      const { products, totalCount } = response.data;
      
      if (!Array.isArray(products)) {
        console.error("Invalid products data structure:", products);
        return;
      }

      console.log("Fetched products:", products);
      
      // Calculate total pages based on totalCount and itemsPerPage
      const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage);

      setProducts(products);
      setTotalPages(calculatedTotalPages);
      setTotalItems(totalCount);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Add a separate function to refresh products after adding or updating
  const refreshProducts = () => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage]);

  const addProduct = async (product: ProductType) => {
    setIsSubmitting(true);
    // Close the form first to ensure immediate feedback
    setShowForm(false);
    
    try {
      const payload: ProductType = {
        name: product.name,
        description: product.description,
        images: product.images ?? [],
        price: product.price,
        quantity: product.quantity,
        slug: product.slug,
        stock: product.stock,
        tags: product.tags ?? [],
        published: product.published,
        defaultCategoryId: product.defaultCategoryId,
        attributes: product.attributes ?? [],
        categories: product.categories?.map(cat => ({
          category: {
            id: cat.category.id,
            name: cat.category.name,
            slug: cat.category.slug,
            published: cat.category.published
          }
        })) ?? []
      };

      console.log("Sending add product payload:", payload);
      const response = await axios.post("/api/products", payload);
      console.log("Add product response:", response.data);
      
      // Instead of trying to update the state directly, fetch fresh data
      refreshProducts();
      
      toast.success("Product added successfully");
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${ids.length} selected products?`);
    if (!confirmed) return;

    try {
      // Delete products one by one
      await Promise.all(
        ids.map(id =>
          fetch(`/api/products/${id}`, {
            method: "DELETE"
          })
        )
      );

      // Remove deleted products from state
      setProducts(prev => prev.filter(p => !ids.includes(p.id as number)));
      
      toast.success(`${ids.length} products deleted successfully!`);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      toast.error("Failed to delete selected products");
    }
  };

  const handleTogglePublish = async (id: number, published: boolean) => {
    try {
      await axios.patch(`/api/products/${id}`, { published });
      
      // Update product in local state
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, published } : p))
      );
      
      toast.success(`Product ${published ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error("Failed to update published status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleEdit = async (product: ProductType) => {
    console.log("Editing product with data:", product);
    
    setIsSubmitting(true);
    // Close the form first to ensure immediate feedback
    setShowForm(false);
    setEditingProduct(null);
    
    try {
      // Make sure to extract defaultCategoryId explicitly to preserve it
      const { defaultCategoryId } = product;
      console.log("Default category ID:", defaultCategoryId);
      
      const payload: ProductType = {
        ...product,
        defaultCategoryId,
        categories: product.categories?.map(cat => ({
          category: {
            id: cat.category.id,
            name: cat.category.name,
            slug: cat.category.slug,
            published: cat.category.published
          }
        })) ?? []
      };

      console.log("Sending update payload:", payload);
      const response = await axios.put(`/api/products/${product.id}`, payload);
      console.log("Update response:", response.data);
      
      // Instead of trying to update the state directly, fetch fresh data
      refreshProducts();
      
      toast.success("Product updated successfully");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (product: ProductType) => {
    if (editingProduct) {
      handleEdit(product);
    } else {
      addProduct(product);
    }
  };

  const onEdit = (product: ProductType) => {
    console.log("Edit clicked for product:", product);
    // Make sure we're using the full product data with all categories and defaultCategory
    const fullProduct = products.find(p => p.id === product.id);
    if (fullProduct) {
      setEditingProduct(fullProduct);
      setShowForm(true);
    } else {
      // Fallback to using the passed product if we can't find it in our list
      setEditingProduct(product);
      setShowForm(true);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md">
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus size={20} />
            Add Product
          </button>
          <button
            onClick={() => handleBulkDelete(selectedProductIds)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedProductIds.length === 0}
          >
            <Trash2 size={20} />
            Delete Selected {selectedProductIds.length > 0 && `(${selectedProductIds.length})`}
          </button>
        </div>
      </div>

      <ProductList
        products={products}
        categories={categories}
        onDelete={handleDelete}
        onEdit={onEdit}
        onTogglePublish={handleTogglePublish}
        onSelectionChange={setSelectedProductIds}
      />

      <SlidingPanel
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          initialData={editingProduct || undefined}
          onSubmit={handleFormSubmit}
          allCategories={categories}
        />
      </SlidingPanel>
    </div>
  );
};

export default ProductsPage;
