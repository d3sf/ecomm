'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper'
import { CartProvider } from '@/contexts/CartContext'
import { AddressProvider } from '@/contexts/AddressContext'
import { ClientInitializer } from '@/components/ClientInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProviderWrapper>
        <ClientInitializer />
        <CartProvider>
          <AddressProvider>
            {children}
          </AddressProvider>
        </CartProvider>
      </SessionProviderWrapper>
    </Provider>
  )
} 