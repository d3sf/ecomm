"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect, useCallback, useRef } from "react";
import CartModal from "./CartModal";
import { theme } from "@/lib/theme";

export default function CartIcon() {
  const { items = [] } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Calculate total items from the cart items with null checking
  const totalItems = isMounted && items && Array.isArray(items) 
    ? items.reduce((sum, item) => sum + (item?.quantity || 0), 0) 
    : 0;
    
  // Check if cart is empty - default to true for server rendering
  const isCartEmpty = !isMounted || totalItems === 0;

  // This ensures component only renders badge on client-side after hydration
  useEffect(() => {
    setIsMounted(true);
    
    // Set aria-label after client-side hydration
    if (buttonRef.current) {
      buttonRef.current.setAttribute(
        'aria-label', 
        `Shopping cart${totalItems > 0 ? ` with ${totalItems} items` : ' (empty)'}`
      );
    }
  }, [totalItems]);

  // Prefetch cart data when hovering over the cart icon
  const prefetchCartData = useCallback(() => {
    if (items && items.length > 0) {
      const productIds = items.map(item => item.id);
      
      // Start prefetching in the background
      fetch('/api/cart-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
        // Using no-store to avoid interfering with other cache strategies
        cache: 'no-store',
      }).catch(() => {
        // Silently fail on prefetch - it's just an optimization
      });
    }
  }, [items]);

  // Handle cart button click
  const handleCartClick = () => {
    // Only open the modal if the cart is not empty
    if (!isCartEmpty) {
      setIsModalOpen(true);
    }
  };

  // For server rendering, use a stable class and disabled state
  const buttonClass = "relative p-2 transition-colors text-gray-400 cursor-not-allowed opacity-70";
  const buttonDisabled = true;
  const buttonTitle = "Your cart is empty";
  
  // Only apply dynamic styling after component has mounted on client
  const clientButtonClass = isMounted ? 
    `relative p-2 transition-colors ${
      isCartEmpty 
        ? 'text-gray-400 cursor-not-allowed opacity-70' 
        : 'text-gray-700 hover:text-gray-900'
    }` : buttonClass;
    
  const clientButtonDisabled = isMounted ? isCartEmpty : buttonDisabled;
  const clientButtonTitle = isMounted ? (isCartEmpty ? "Your cart is empty" : "View your cart") : buttonTitle;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleCartClick}
        onMouseEnter={!isCartEmpty && isMounted ? prefetchCartData : undefined}
        onFocus={!isCartEmpty && isMounted ? prefetchCartData : undefined}
        className={clientButtonClass}
        disabled={clientButtonDisabled}
        aria-label="Shopping cart"
        title={clientButtonTitle}
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