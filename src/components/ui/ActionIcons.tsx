import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

interface ActionIconsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ActionIcons: React.FC<ActionIconsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onEdit}
        className="text-gray-600 hover:text-indigo-600 transition-colors"
        title="Edit"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="text-gray-600 hover:text-red-600 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ActionIcons; 