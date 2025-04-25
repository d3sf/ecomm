import React from 'react';
import { Trash2, FilePenLine } from 'lucide-react';

interface ActionIconsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ActionIcons: React.FC<ActionIconsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onEdit}
        className="text-indigo-600 hover:text-indigo-900"
        title="Edit"
      >
        <FilePenLine size={18} />
      </button>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-900"
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default ActionIcons; 