"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import type { Category } from "@/types";
import type { ProductType } from "@/lib/zodvalidation";
import ImageUpload from "@/components/ImageUpload";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { ChevronDown, ChevronRight, X } from "lucide-react";

interface ProductFormProps {
  initialData?: ProductType;
  onSubmit: (data: ProductType) => void;
  allCategories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  allCategories
}) => {
  const [product, setProduct] = useState<ProductType>(
    initialData || {
      name: "",
      description: "",
      images: [],
      categories: [],
      price: 0,
      quantity: "",
      slug: "",
      stock: 0,
      tags: [],
      published: false,
      attributes: [],
      defaultCategoryId: undefined
    }
  );

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setProduct(initialData);
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategorySelect = (categoryId: number, category: Category) => {
    setProduct(prev => {
      const currentCategories = prev.categories || [];
      const categoryExists = currentCategories.some(
        cat => cat.category.id === categoryId
      );

      if (categoryExists) {
        return {
          ...prev,
          categories: currentCategories.filter(
            cat => cat.category.id !== categoryId
          ),
        };
      } else {
        return {
          ...prev,
          categories: [
            ...currentCategories,
            {
              category: {
                id: categoryId,
                name: category.name,
                slug: category.slug,
                published: category.published,
                parentId: null,
                sortOrder: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          ]
        };
      }
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(product);
  };

  // Organize categories into a hierarchical structure
  const organizeCategories = () => {
    const parentCategories = allCategories.filter(cat => !cat.parentId);
    const categoryMap = new Map<number, Category[]>();
    
    // Group subcategories by parent ID
    allCategories.forEach(cat => {
      if (cat.parentId) {
        const parentId = typeof cat.parentId === 'string' ? parseInt(cat.parentId) : cat.parentId;
        if (!categoryMap.has(parentId)) {
          categoryMap.set(parentId, []);
        }
        categoryMap.get(parentId)?.push(cat);
      }
    });
    
    return { parentCategories, categoryMap };
  };

  const { parentCategories, categoryMap } = organizeCategories();

  // Get selected category names for display
  const selectedCategoryNames = product.categories
    ?.map(cat => cat.category.name)
    .filter(Boolean) || [];

  return (
    <div className="h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
        {/* Name */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="flex items-start gap-4">
          <label className="w-40 font-medium mt-2">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.description}
            onChange={handleChange}
          />
        </div>

        {/* Image Upload */}
        <div className="flex items-start gap-4">
          <label className="w-40 font-medium mt-2">Images</label>
          <div className="flex-1">
            <ImageUpload
              images={product.images || []}
              onChange={(images) =>
                setProduct(prev => ({ ...prev, images }))
              }
              label="Product Images"
              multiple
              folder="products"
            />
            <div className="mt-2 text-sm text-gray-500">
              If no image is uploaded, a placeholder will be shown
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-start gap-4">
          <label className="w-40 font-medium mt-2">Categories</label>
          <div className="flex-1 space-y-4">
            {/* Selected Categories */}
            {selectedCategoryNames.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryNames.map((name, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => {
                          const categoryToRemove = product.categories?.find(
                            cat => cat.category.name === name
                          );
                          if (categoryToRemove) {
                            handleCategorySelect(categoryToRemove.category.id, {
                              id: categoryToRemove.category.id.toString(),
                              name: categoryToRemove.category.name,
                              slug: categoryToRemove.category.slug,
                              published: categoryToRemove.category.published,
                              parentId: null,
                              sortOrder: 0,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString()
                            });
                          }
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hierarchical Category List */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="p-2 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Available Categories</h4>
              </div>
              <div className="p-3 space-y-3">
                {parentCategories.map((category) => {
                  const categoryId = typeof category.id === 'string' ? parseInt(category.id) : category.id;
                  return (
                    <div key={categoryId}>
                      <div className="flex items-center">
                        {categoryMap.get(categoryId)?.length ? (
                          <button
                            type="button"
                            onClick={() => toggleCategory(categoryId)}
                            className="p-1 hover:bg-gray-200 rounded mr-2"
                          >
                            {expandedCategories.includes(categoryId) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="mr-2 text-gray-400">•</span>
                        )}
                        <input
                          type="checkbox"
                          checked={product.categories?.some(
                            c => c.category.id === categoryId
                          )}
                          onChange={() => handleCategorySelect(categoryId, category)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      
                      {/* Subcategories */}
                      {expandedCategories.includes(categoryId) && categoryMap.get(categoryId) && (
                        <div className="pl-8 mt-1">
                          {categoryMap.get(categoryId)?.map((subcategory) => {
                            const subcategoryId = typeof subcategory.id === 'string' ? parseInt(subcategory.id) : subcategory.id;
                            return (
                              <div key={subcategoryId} className="flex items-center py-1">
                                <input
                                  type="checkbox"
                                  checked={product.categories?.some(
                                    c => c.category.id === subcategoryId
                                  )}
                                  onChange={() => handleCategorySelect(subcategoryId, subcategory)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                />
                                <span>{subcategory.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Default Category */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Default Category</label>
          <select
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.defaultCategoryId || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : undefined;
              setProduct(prev => ({ ...prev, defaultCategoryId: value }));
            }}
          >
            <option value="">Select Default Category (optional)</option>
            {product.categories?.map((cat) => (
              <option key={cat.category.id} value={cat.category.id}>
                {cat.category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Price</label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Quantity</label>
          <input
            type="text"
            name="quantity"
            placeholder="Quantity (e.g., 500ml)"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.quantity}
            onChange={handleChange}
          />
        </div>

        {/* Stock */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.stock}
            onChange={handleChange}
          />
        </div>

        {/* Slug */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Slug</label>
          <input
            type="text"
            name="slug"
            placeholder="Slug (optional)"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.slug}
            onChange={handleChange}
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Tags</label>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma-separated)"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={product.tags?.join(",") || ""}
            onChange={(e) =>
              setProduct(prev => ({
                ...prev,
                tags: e.target.value
                  .split(",")
                  .map(tag => tag.trim())
                  .filter(tag => tag !== ""),
              }))
            }
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Published</label>
          <ToggleSwitch
            isOn={product.published}
            onToggle={(val) =>
              setProduct(prev => ({
                ...prev,
                published: val,
              }))
            }
          />
        </div>

        {/* Attributes - Optional */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Attributes (Optional)
            </label>
            <button
              type="button"
              onClick={() =>
                setProduct(prev => ({
                  ...prev,
                  attributes: [
                    ...(prev.attributes || []),
                    { name: "", value: "" },
                  ],
                }))
              }
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              + Add Attribute
            </button>
          </div>
          {(product.attributes || []).map((attr, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Name"
                className="flex-1 p-2 border border-gray-300 rounded"
                value={attr.name}
                onChange={(e) => {
                  const updated = [...(product.attributes || [])];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setProduct(prev => ({ ...prev, attributes: updated }));
                }}
              />
              <input
                type="text"
                placeholder="Value"
                className="flex-1 p-2 border border-gray-300 rounded"
                value={attr.value}
                onChange={(e) => {
                  const updated = [...(product.attributes || [])];
                  updated[index] = { ...updated[index], value: e.target.value };
                  setProduct(prev => ({ ...prev, attributes: updated }));
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = [...(product.attributes || [])];
                  updated.splice(index, 1);
                  setProduct(prev => ({ ...prev, attributes: updated }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
