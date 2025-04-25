'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from 'lucide-react';

interface AddToCartButtonProps {
  productId: string | number;
  onAddToCart: (productId: string | number, quantity: number) => void;
  initialQuantity?: number;
  className?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  onAddToCart,
  initialQuantity = 0,
  className = '',
  textColor = 'text-green-600',
  borderColor = 'border-green-600',
  backgroundColor = 'bg-green-50',
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  // Update local state when initialQuantity changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleAddToCart = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onAddToCart(productId, newQuantity);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onAddToCart(productId, newQuantity);
    } else if (quantity === 1) {
      // When quantity is 1 and we decrease, remove the item
      setQuantity(0);
      onAddToCart(productId, 0); // This will trigger the removeFromCart in the parent
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {quantity === 0 ? (
        <button
          onClick={handleAddToCart}
          className={`w-full py-1.5 px-3 rounded-md border ${borderColor} ${textColor} ${backgroundColor} hover:opacity-80 transition-opacity text-sm font-medium`}
        >
          Add
        </button>
      ) : (
        <div className={`flex items-center justify-between py-1 px-2 rounded-md border ${borderColor} ${backgroundColor}`}>
          <button
            onClick={decreaseQuantity}
            className={`${textColor} p-1 hover:bg-green-100 rounded-full`}
            aria-label="Decrease quantity"
          >
            <MinusIcon size={16} />
          </button>
          <span className={`${textColor} text-sm font-medium`}>{quantity}</span>
          <button
            onClick={handleAddToCart}
            className={`${textColor} p-1 hover:bg-green-100 rounded-full`}
            aria-label="Increase quantity"
          >
            <PlusIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton; 