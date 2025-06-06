"use client";

import React, { useState } from "react";
import type { CategoryType } from "@/lib/zodvalidation";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import ActionIcons from "@/components/ui/ActionIcons";

interface CategoryListProps {
  categories: CategoryType[];
  allCategories?: CategoryType[];
  onTogglePublish: (id: number, published: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (category: CategoryType) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onSelectionChange: (selectedIds: number[]) => void;
  currentPath?: number[];
  onPathChange?: (path: number[]) => void;
  breadcrumbNames?: string[];
  onSearch: (term: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  allCategories = [],
  onTogglePublish,
  onDelete,
  onEdit,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onSelectionChange,
  currentPath = [],
  onPathChange = () => {},
  breadcrumbNames = [],
  onSearch,
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const handleSelectionChange = (ids: number[]) => {
    setSelectedCategoryIds(ids);
    onSelectionChange(ids);
  };

  const handleCategoryClick = (category: CategoryType) => {
    const childCategories = allCategories.filter(cat => cat.parentId === category.id);
    if (childCategories.length > 0 && category.id) {
      const newPath = [...currentPath, category.id];
      onPathChange(newPath);
    }
  };

  const handleSubcategoryClick = (categoryId: number) => {
    if (categoryId) {
      const newPath = [...currentPath, categoryId];
      onPathChange(newPath);
    }
  };

  const handleBackClick = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      onPathChange(newPath);
    }
  };

  const toggleCategoryExpand = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Handle toggle of subcategories display
  const handleToggleSubcategories = () => {
    const newShowSubcategories = !showSubcategories;
    setShowSubcategories(newShowSubcategories);
    
    // If turning on subcategories, expand all parent categories
    if (newShowSubcategories) {
      const parentCategoryIds = allCategories
        .filter(cat => allCategories.some(c => c.parentId === cat.id))
        .map(cat => cat.id || 0)
        .filter(id => id > 0);
      
      setExpandedCategories(parentCategoryIds);
    }
  };

  return (
    <div className="mt-4 pb-8">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center mb-4">
        <button
          onClick={handleBackClick}
          className="text-blue-500 hover:text-blue-700 mr-2"
          disabled={currentPath.length === 0}
        >
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div className="flex items-center">
          <span 
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={() => onPathChange([])}
          >
            Categories
          </span>
          {breadcrumbNames.map((name, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={16} className="mx-2 text-gray-400" />
              <span 
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                onClick={() => onPathChange(currentPath.slice(0, index + 1))}
              >
                {name}
              </span>
            </React.Fragment>
          ))}
        </div>
        
        <div className="ml-auto flex items-center">
          <span className="mr-2 text-sm text-gray-700">Show Subcategories</span>
          <ToggleSwitch 
            isOn={showSubcategories} 
            onToggle={handleToggleSubcategories} 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={(e) => {
                    const ids = e.target.checked ? categories.map(cat => cat.id || 0) : [];
                    handleSelectionChange(ids);
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sr. No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => {
              const hasChildren = allCategories.some(cat => cat.parentId === category.id);
              const subcategories = allCategories.filter(cat => cat.parentId === category.id);
              const isExpanded = expandedCategories.includes(category.id || 0);
              
              return (
                <React.Fragment key={category.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedCategoryIds.includes(category.id || 0)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSelectedIds = e.target.checked
                            ? [...selectedCategoryIds, category.id || 0]
                            : selectedCategoryIds.filter(id => id !== category.id);
                          handleSelectionChange(newSelectedIds);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image && (
                        <Image
                          src={category.image.url}
                          alt={category.name}
                          width={50}
                          height={50}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center cursor-pointer" onClick={() => handleCategoryClick(category)}>
                          {hasChildren && showSubcategories && (
                            <button 
                              onClick={(e) => toggleCategoryExpand(category.id || 0, e)}
                              className="mr-1 text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                          {hasChildren && !showSubcategories && (
                            <ChevronRight className="ml-2 text-gray-400" size={16} />
                          )}
                        </div>
                        
                        {/* Show subcategory names if expanded and showSubcategories is enabled */}
                        {showSubcategories && isExpanded && subcategories.length > 0 && (
                          <div className="ml-6 mt-2 border-l-2 border-gray-300 pl-2">
                            {subcategories.map(subcat => (
                              <div 
                                key={subcat.id} 
                                className="py-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubcategoryClick(subcat.id || 0);
                                }}
                              >
                                - {subcat.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.productCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ToggleSwitch
                        isOn={category.published || false}
                        onToggle={(val) => {
                          if (category.id) {
                            onTogglePublish(category.id, val);
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionIcons
                        onEdit={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onEdit(category);
                        }}
                        onDelete={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (category.id) {
                            onDelete(category.id);
                          }
                        }}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default CategoryList;
