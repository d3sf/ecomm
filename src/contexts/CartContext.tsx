'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  productId: string | number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string | number, quantity: number) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string | number) => number;
  totalItems: number;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  const addToCart = (productId: string | number, quantity: number) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === productId);

      if (existingItemIndex !== -1) {
        // If quantity is 0, remove the item
        if (quantity <= 0) {
          return prevItems.filter(item => item.productId !== productId);
        }

        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity };
        return updatedItems;
      } else if (quantity > 0) {
        // Add new item
        return [...prevItems, { productId, quantity }];
      }

      return prevItems;
    });
  };

  const removeFromCart = (productId: string | number) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string | number) => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
