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
  // For backward compatibility with existing components
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

  // For backward compatibility with existing components
  const addToCart = (productId: string | number, quantity: number) => {
    try {
      const stringId = String(productId)
      const existingItem = items?.find(item => item.id === stringId)
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item
        dispatch(removeFromCart(stringId))
      } else if (existingItem) {
        // If item exists, update its quantity
        dispatch(updateQuantity({ id: stringId, quantity }))
      } else {
        // This will likely never be called as we're now handling adding new items directly
        // through the addItem function, but keeping for backward compatibility
        console.warn('Using legacy addToCart. Consider using addItem with full product details.')
      }
      
      // Ensure all zero quantity items are properly removed from cart
      items.forEach(item => {
        if (item.quantity <= 0) {
          dispatch(removeFromCart(item.id))
        }
      })
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
    }
  }

  const getItemQuantity = (productId: string | number) => {
    if (!items || !Array.isArray(items)) return 0
    const item = items.find(item => item.id === String(productId))
    return item ? item.quantity : 0
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
        // For backward compatibility
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
