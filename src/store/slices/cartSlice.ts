import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartState {
  items: CartItem[]
  total: number
  loading: boolean
  error: string | null
}

// Default empty state
const defaultState: CartState = {
  items: [],
  total: 0,
  loading: false,
  error: null
}

// Load cart from localStorage if available
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { ...defaultState }
  }

  try {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart) as Partial<CartState>
      
      // Ensure we only load items with positive quantity
      const validItems = Array.isArray(parsedCart.items) 
        ? parsedCart.items.filter(item => item && item.quantity > 0) 
        : []
      
      // Recalculate total based on valid items
      const calculatedTotal = validItems.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      )
      
      return {
        items: validItems,
        total: calculatedTotal,
        loading: false,
        error: null
      }
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
  }

  return { ...defaultState }
}

const initialState: CartState = loadCartFromStorage()

// Helper function to save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify({
        items: state.items || [],
        total: state.total || 0
      }))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // Ensure items array exists
      if (!state.items) {
        state.items = []
      }
      
      // Only add/update items with positive quantity
      if (action.payload.quantity > 0) {
        const existingItem = state.items.find(item => item.id === action.payload.id)
        if (existingItem) {
          existingItem.quantity = action.payload.quantity
        } else {
          state.items.push(action.payload)
        }
        // Clean up any items with 0 quantity
        state.items = state.items.filter(item => item.quantity > 0)
        state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
        saveCartToStorage(state)
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      if (!state.items) {
        state.items = []
        return
      }
      
      state.items = state.items.filter(item => item.id !== action.payload)
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      saveCartToStorage(state)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      if (!state.items) {
        state.items = []
        return
      }
      
      const { id, quantity } = action.payload
      
      // If quantity is 0 or negative, remove the item
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id)
      } else {
        const item = state.items.find(item => item.id === id)
        if (item) {
          item.quantity = quantity
        }
      }
      
      // Clean up any items with 0 quantity
      state.items = state.items.filter(item => item.quantity > 0)
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      saveCartToStorage(state)
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      saveCartToStorage(state)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  setLoading,
  setError
} = cartSlice.actions

export default cartSlice.reducer 