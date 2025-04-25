'use client';

import React, { useState } from 'react';
import { CategoryType } from '@/lib/zodvalidation';
import { Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface CategoryNode extends CategoryType {
  children?: CategoryNode[];
}

interface CategoryTreeProps {
  categories: CategoryType[];
  onSelect: (category: CategoryType) => void;
  onDelete: (categoryId: number) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onSelect,
  onDelete,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const buildTree = (items: CategoryType[], parentId: number | null = null): CategoryNode[] => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id!),
      }));
  };

  const renderNode = (category: CategoryNode) => {
    const isExpanded = category.id !== undefined && expandedNodes.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isParent = hasChildren;

    return (
      <div key={category.id} className="ml-2 my-2">
        <div 
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all ${
            isParent 
              ? 'bg-gray-50 border border-gray-200 shadow-sm hover:shadow' 
              : 'hover:bg-gray-50'
          }`}
        >
          {hasChildren && (
            <button
              onClick={() => category.id !== undefined && toggleNode(category.id)}
              className="text-gray-500 hover:text-gray-700 flex items-center justify-center w-6 h-6"
            >
              {isExpanded 
                ? <ChevronDown className="text-gray-600" size={18} /> 
                : <ChevronRight className="text-gray-600" size={18} />
              }
            </button>
          )}
          {!hasChildren && <div className="w-6"></div>}
          <span
            className={`cursor-pointer ${isParent ? 'font-medium' : ''} hover:text-blue-500`}
            onClick={() => onSelect(category)}
          >
            {category.name}
            {category.published === false && <span className="ml-2 text-xs text-gray-500">(unpublished)</span>}
          </span>
          <button
            onClick={() => category.id !== undefined && onDelete(category.id)}
            className="ml-auto text-red-500 hover:text-red-700 opacity-50 hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-6 pl-2 border-l border-gray-200 mt-1">
            {category.children?.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(categories);

  return (
    <div className="p-4">
      {tree.map(category => renderNode(category))}
    </div>
  );
};

export default CategoryTree; 