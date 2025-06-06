"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import CartModal from "./CartModal";
import { theme } from "@/lib/theme";

export default function CartIcon() {
  const { items = [] } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Memoize total items calculation
  const totalItems = useMemo(() => {
    return isMounted && items && Array.isArray(items) 
      ? items.reduce((sum, item) => sum + (item?.quantity || 0), 0) 
      : 0;
  }, [isMounted, items]);
    
  // Memoize cart empty state
  const isCartEmpty = useMemo(() => {
    return !isMounted || totalItems === 0;
  }, [isMounted, totalItems]);

  // Memoize aria-label
  const ariaLabel = useMemo(() => {
    return `Shopping cart${totalItems > 0 ? ` with ${totalItems} items` : ' (empty)'}`;
  }, [totalItems]);

  // Set mounted state only once
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update aria-label when it changes
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.setAttribute('aria-label', ariaLabel);
    }
  }, [ariaLabel]);

  // Prefetch cart data when hovering over the cart icon
  const prefetchCartData = useCallback(() => {
    if (items && items.length > 0) {
      const productIds = items.map(item => item.id);
      
      fetch('/api/cart-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
        cache: 'no-store',
      }).catch(() => {
        // Silently fail on prefetch
      });
    }
  }, [items]);

  // Handle cart button click
  const handleCartClick = useCallback(() => {
    if (!isCartEmpty) {
      setIsModalOpen(true);
    }
  }, [isCartEmpty]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleCartClick}
        onMouseEnter={!isCartEmpty && isMounted ? prefetchCartData : undefined}
        onFocus={!isCartEmpty && isMounted ? prefetchCartData : undefined}
        className={`relative p-2 transition-colors ${
          isCartEmpty 
            ? 'text-gray-400 cursor-not-allowed opacity-70' 
            : 'text-gray-700 hover:text-gray-900'
        }`}
        disabled={isCartEmpty}
        title={isCartEmpty ? "Your cart is empty" : "View your cart"}
      >
        <ShoppingCart className="h-6 w-6" />
        {isMounted && totalItems > 0 && (
          <span 
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: theme.primary }}
          >
            {totalItems}
          </span>
        )}
      </button>

      <CartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
} 