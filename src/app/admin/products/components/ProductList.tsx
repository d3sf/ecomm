"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { ProductType, CategoryType } from "@/lib/zodvalidation";
import { toast } from "react-hot-toast";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ActionIcons from "@/components/ui/ActionIcons";
import Pagination from "@/components/ui/Pagination";

interface ProductListProps {
  products: ProductType[];
  onDelete: (id: number) => void;
  categories: CategoryType[];
  onEdit: (product: ProductType) => void;
  onTogglePublish: (id: number, published: boolean) => void;
  onSelectionChange: (selectedIds: number[]) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onDelete,
  onEdit,
  onTogglePublish,
  onSelectionChange,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onSearch
}) => {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Debounce search term to prevent too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await onDelete(id);
        toast.success("Product deleted successfully");
      } catch (error: unknown) {
        console.error("Error deleting product:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
        toast.error(errorMessage);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ids = e.target.checked ? products.map(product => product.id!).filter(id => id !== undefined) : [];
    setSelectedProducts(ids);
    onSelectionChange(ids);
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      // Notify parent component of selection change
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const handleEditClick = (product: ProductType) => {
    onEdit(product);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Delete Selected button removed since it's already in the parent */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-100">
            <tr className="bg-gray-50">
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedProducts.length === products.length && products.length > 0}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Default Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Stock</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Published</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const isOutOfStock = product.stock === 0;
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id!)}
                      onChange={() => handleSelectProduct(product.id!)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md bg-white flex items-center justify-center border border-gray-300 shadow-sm overflow-hidden">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-2">
                    
                    {product.defaultCategory ? (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {product.defaultCategory.name}
                      </span>
                      
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        Uncategorized
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">₹{product.price}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      isOutOfStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}>
                      {isOutOfStock ? "Out of Stock" : product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <ToggleSwitch
                      isOn={product.published}
                      onToggle={(value) => onTogglePublish(product.id!, value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <ActionIcons
                      onEdit={(e) => {
                        e.stopPropagation();
                        handleEditClick(product);
                      }}
                      onDelete={(e) => {
                        e.stopPropagation();
                        if (product.id) {
                          handleDelete(product.id);
                        }
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 border-t border-gray-200">
        <Pagination
          key={`pagination-${currentPage}-${totalPages}`}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => {
            console.log("ProductList passing page change:", page);
            onPageChange(page);
          }}
        />
      </div>
    </div>
  );
};

export default ProductList;
