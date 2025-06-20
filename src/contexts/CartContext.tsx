'use client';

import { createContext, useContext } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addToCart as reduxAddToCart, removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice'
import { toast } from 'react-hot-toast'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCartItems: () => void
  total: number
  addToCart: (productId: string | number, quantity: number) => void
  getItemQuantity: (productId: string | number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { items = [], total = 0 } = useAppSelector((state) => state.cart)

  const addItem = (item: CartItem) => {
    try {
      dispatch(reduxAddToCart(item))
    } catch (error) {
      console.error('Error adding item to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const removeItem = (id: string) => {
    try {
      dispatch(removeFromCart(id))
    } catch (error) {
      console.error('Error removing item from cart:', error)
      toast.error('Failed to remove item from cart')
    }
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        dispatch(removeFromCart(id))
      } else {
        dispatch(updateQuantity({ id, quantity }))
      }
    } catch (error) {
      console.error('Error updating item quantity:', error)
      toast.error('Failed to update item quantity')
    }
  }

  const clearCartItems = () => {
    try {
      dispatch(clearCart())
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }

  const addToCart = (productId: string | number, quantity: number) => {
    try {
      const stringId = String(productId)
      const existingItem = items.find(item => item.id === stringId)
      
      if (quantity <= 0) {
        dispatch(removeFromCart(stringId))
      } else if (existingItem) {
        dispatch(updateQuantity({ id: stringId, quantity }))
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
    }
  }

  const getItemQuantity = (productId: string | number): number => {
    const item = items.find(item => item.id === String(productId))
    return item?.quantity || 0
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCartItems,
        total,
        addToCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
