import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'

// Create Redux store
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  // Add middleware to handle non-serializable values during development
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values that might come from localStorage
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 