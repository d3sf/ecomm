'use client';

import React, { useState } from 'react';
import { CategoryType } from '@/lib/zodvalidation';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { ZoomIn, Trash2, FilePenLine, Plus } from 'lucide-react';
import Image from 'next/image';
import Pagination from '@/components/ui/Pagination';

interface CategoryListProps {
  categories: CategoryType[];
  onTogglePublish: (id: number, published: boolean) => void;
  onDelete: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  onEdit: (category: CategoryType) => void;
  onAdd: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showActionButtons?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onTogglePublish,
  onDelete,
  onBulkDelete,
  onEdit,
  onAdd,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showActionButtons = true,
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedCategoryIds((prev) =>
      checked ? [...prev, id] : prev.filter((cid) => cid !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = categories.map((c) => c.id).filter((id): id is number => id !== undefined);
      setSelectedCategoryIds(allIds);
    } else {
      setSelectedCategoryIds([]);
    }
  };

  const isAllSelected = selectedCategoryIds.length === categories.length && categories.length > 0;

  return (
    <div className="mt-4 pb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Category List</h2>
        {showActionButtons && (
          <div className="flex items-center gap-4">
            <button
              onClick={onAdd}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600 transition-colors"
            >
              <Plus size={18} />
              Add Category
            </button>
            <button
              onClick={() => onBulkDelete(selectedCategoryIds)}
              disabled={selectedCategoryIds.length === 0}
              className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-300">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Category Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Parent</th>
              <th className="px-4 py-2 text-center">View</th>
              <th className="px-4 py-2 text-center">Published</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isPublished = category.published === true;
              const isSelected = category.id !== undefined && selectedCategoryIds.includes(category.id);

              return (
                <tr key={category.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        category.id !== undefined && handleSelect(category.id, e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-gray-300 shadow-sm">
                      <Image
                        src={category.image?.url || "/placeholder.png"}
                        alt="category img"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2">{category.slug}</td>
                  <td className="px-4 py-2">
                    {categories.find(c => c.id === category.parentId)?.name || "None"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      title="View"
                      className="text-gray-400 hover:text-green-500"
                    >
                      <ZoomIn />
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center h-full">
                      <ToggleSwitch
                        isOn={isPublished}
                        onToggle={(val) => {
                          if (category.id !== undefined) {
                            onTogglePublish(category.id, val);
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-gray-400 hover:text-green-500"
                      >
                        <FilePenLine />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => {
                          if (category.id !== undefined) {
                            onDelete(category.id);
                          }
                        }}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-t-gray-300 border-t pb-4 px-6 uppercase font-semibold text-gray-500 text-xs">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryList; 