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

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return {
      items: [],
      total: 0,
      loading: false,
      error: null
    }
  }

  try {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      const validItems = Array.isArray(parsedCart.items) 
        ? parsedCart.items.filter((item: CartItem) => item && item.quantity > 0)
        : []
      
      return {
        items: validItems,
        total: calculateTotal(validItems),
        loading: false,
        error: null
      }
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
  }

  return {
    items: [],
    total: 0,
    loading: false,
    error: null
  }
}

const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        total: state.total
      }))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }
}

const initialState: CartState = loadCartFromStorage()

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id)
      
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity = action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
      
      state.items = state.items.filter(item => item.quantity > 0)
      state.total = calculateTotal(state.items)
      saveCartToStorage(state)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.total = calculateTotal(state.items)
      saveCartToStorage(state)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id)
      } else {
        const item = state.items.find(item => item.id === id)
        if (item) {
          item.quantity = quantity
        }
      }
      
      state.total = calculateTotal(state.items)
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