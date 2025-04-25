"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import CartModal from "./CartModal";

export default function CartIcon() {
  const { totalItems } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative p-2 text-gray-700 hover:text-gray-900"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
            {totalItems}
          </span>
        )}
      </button>

      <CartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
} 