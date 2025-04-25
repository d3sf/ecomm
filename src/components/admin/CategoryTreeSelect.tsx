'use client';

import React from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import { CategoryType } from '@/lib/zodvalidation';

interface CategoryTreeSelectProps {
  categories: CategoryType[];
  value?: number | null;
  onChange: (value: number | null) => void;
  currentCategoryId?: number;
}

interface TreeNode {
  key: number;
  title: string;
  children: TreeNode[];
  disabled?: boolean;
}

const CategoryTreeSelect: React.FC<CategoryTreeSelectProps> = ({
  categories = [],
  value,
  onChange,
  currentCategoryId,
}) => {
  const getAllDescendants = (categoryId: number): number[] => {
    const directChildren = categories
      .filter(category => category.parentId === categoryId)
      .map(category => category.id!);
    
    const allDescendants = [...directChildren];
    
    directChildren.forEach(childId => {
      allDescendants.push(...getAllDescendants(childId));
    });
    
    return allDescendants;
  };

  const buildTreeData = (categories: CategoryType[], parentId: number | null = null): TreeNode[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => {
        const isCurrentCategory = currentCategoryId !== undefined && category.id === currentCategoryId;
        const isDescendant = currentCategoryId !== undefined && category.id !== undefined && 
          getAllDescendants(currentCategoryId).includes(category.id);
        
        return {
          key: category.id!,
          title: category.name + (isCurrentCategory ? ' (current)' : '') + (isDescendant ? ' (descendant)' : ''),
          children: buildTreeData(categories, category.id!),
          disabled: isCurrentCategory || isDescendant,
        };
      });
  };

  const treeData = buildTreeData(categories);

  return (
    <div className="border rounded-md p-2">
      <Tree
        treeData={treeData}
        selectedKeys={value ? [value.toString()] : []}
        onSelect={(selectedKeys, info) => {
          if (info.node?.disabled) {
            return;
          }
          
          if (selectedKeys.length > 0) {
            onChange(parseInt(selectedKeys[0] as string));
          } else {
            onChange(null);
          }
        }}
        defaultExpandAll
      />
    </div>
  );
};

export default CategoryTreeSelect; 