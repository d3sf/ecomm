// components/ui/AddButton.tsx
"use client";

import React from "react";

interface AddButtonProps {
  label: string;
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white p-2 rounded mb-4 hover:bg-blue-600 transition"
    >
      {label}
    </button>
  );
};

export default AddButton;
