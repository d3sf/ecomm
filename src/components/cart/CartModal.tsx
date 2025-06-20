"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ProductType } from "@/lib/zodvalidation";
import AddToCartButton from "./AddToCartButton";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/currency";
import { theme, withOpacity } from "@/lib/theme";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemWithDetails extends Omit<ProductType, 'quantity'> {
  cartQuantity: number;
  originalProductId: string | number;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items = [], addItem } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousItemsRef = useRef<typeof items>([]);
  const cartDataFetchedRef = useRef(false);
  
  // Calculate subtotal using useMemo
  const subtotal = useMemo(() => {
    const visibleItems = cartItems.filter(item => item.cartQuantity > 0);
    
    if (visibleItems.length === 0) {
      return 0;
    }

    return visibleItems.reduce((total, item) => {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price)
        : item.price;
      return total + (price * item.cartQuantity);
    }, 0);
  }, [cartItems]);

  const handleDirectCartUpdate = useCallback((productId: string | number, quantity: number, item: CartItemWithDetails) => {
    if (item && typeof item === 'object') {
      // Update local state
      setCartItems(prevItems => 
        prevItems.map(cartItem => 
          String(cartItem.originalProductId) === String(productId)
            ? { ...cartItem, cartQuantity: quantity }
            : cartItem
        )
      );
      
      // Update Redux store
      addItem({
        id: String(productId),
        name: item.name,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        quantity: quantity,
        image: item.images?.[0]?.url || "/placeholder.png"
      });
    }
  }, [addItem]);

  const handleProceedToCheckout = useCallback(() => {
    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onClose();
    router.push('/checkout');
  }, [items, onClose, router]);

  const fetchCartItems = useCallback(async () => {
    if (!items || items.length === 0) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const productIds = items.map(item => item.id);
      
      const response = await fetch('/api/cart-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const { products } = await response.json();
      
      if (!products || !Array.isArray(products)) {
        console.error('Invalid products data returned from API');
        toast.error('Failed to load cart items');
        return;
      }

      const itemsWithDetails = items.map(item => {
        const product = products.find((p: ProductType) =>
          String(p.id) === String(item.id)
        );

        if (product) {
          const { ...productWithoutQuantity } = product;
          return {
            ...productWithoutQuantity,
            cartQuantity: item.quantity,
            originalProductId: item.id
          };
        }
        return null;
      }).filter(Boolean) as CartItemWithDetails[];

      setCartItems(itemsWithDetails);
      cartDataFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  // Set mounted state only once
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update cart items when items change
  useEffect(() => {
    const itemsChanged = JSON.stringify(items) !== JSON.stringify(previousItemsRef.current);
    
    if (itemsChanged) {
      previousItemsRef.current = [...items];
      
      if (isOpen || (!cartDataFetchedRef.current && items.length > 0)) {
        fetchCartItems();
      } else {
        // Just update quantities without fetching
        setCartItems(prevItems => 
          prevItems.map(cartItem => {
            const matchingItem = items.find(item => 
              String(item.id) === String(cartItem.originalProductId)
            );
            return matchingItem 
              ? { ...cartItem, cartQuantity: matchingItem.quantity }
              : cartItem;
          })
        );
      }
    }
  }, [items, isOpen, fetchCartItems]);

  // Watch for empty cart and trigger onClose in useEffect
  useEffect(() => {
    const hasItems = items.some(item => item.quantity > 0);
    if (!hasItems && isOpen) {
      onClose();
    }
  }, [items, isOpen, onClose]);

  // Fetch items when modal opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      fetchCartItems();
    }
  }, [isOpen, items.length, fetchCartItems]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ height: '100vh' }}
      >
        <div className="w-screen max-w-lg" style={{ height: '100vh' }}>
          <div className="flex flex-col bg-white shadow-xl" style={{ height: '100vh' }}>
            {/* Header - Fixed height */}
            <div 
              className="flex-shrink-0 flex items-center justify-between px-6 py-6 border-b bg-white"
              style={{ borderColor: withOpacity(theme.primary, 0.1) }}
            >
              <h2 className="text-xl font-medium" style={{ color: theme.dark }}>Shopping Cart</h2>
              <button
                type="button"
                className="hover:text-gray-500 transition-colors"
                style={{ color: theme.gray }}
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items - Flexible height with scrolling */}
            <div className="flex-grow overflow-y-auto px-6 py-6">
              {isLoading && cartItems.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.primary }} />
                </div>
              ) : !items || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: withOpacity(theme.primary, 0.1) }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.primary }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-lg mb-2" style={{ color: theme.gray }}>Your cart is empty</p>
                  <p className="text-sm" style={{ color: theme.gray }}>Add some items to get started.</p>
                </div>
              ) : (
                <ul className="divide-y" style={{ borderColor: withOpacity(theme.primary, 0.1) }}>
                  {cartItems.filter(item => item.cartQuantity > 0).map((item) => (
                    <li key={`cart-item-${item.id}-${item.cartQuantity}`} className="flex py-6">
                      {/* Product Image */}
                      <div 
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border"
                        style={{ borderColor: withOpacity(theme.primary, 0.1) }}
                      >
                        <Image
                          src={item.images?.[0]?.url || "/placeholder.png"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium" style={{ color: theme.dark }}>
                            <h3>{item.name}</h3>
                            <p className="ml-4">{formatCurrency(item.price)}</p>
                          </div>
                          <p className="mt-1 text-sm" style={{ color: theme.gray }}>{item.description}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center">
                            <AddToCartButton
                              productId={String(item.id)}
                              initialQuantity={item.cartQuantity}
                              onAddToCart={(productId, quantity) => handleDirectCartUpdate(productId, quantity, item)}
                              textColor="text-green-600"
                              borderColor="border-green-600"
                              backgroundColor="bg-green-50"
                            />
                          </div>
                          <button
                            type="button"
                            className="font-medium hover:opacity-75 transition-opacity"
                            style={{ color: theme.primary }}
                            onClick={() => handleDirectCartUpdate(String(item.id), 0, item)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer - Fixed height */}
            <div 
              className="flex-shrink-0 border-t px-6 py-6"
              style={{ borderColor: withOpacity(theme.primary, 0.1) }}
            >
              <div className="flex justify-between text-base font-medium mb-4" style={{ color: theme.dark }}>
                <p>Subtotal</p>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: theme.gray }}>
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 hover:shadow-md"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm">
                <p>
                  <button
                    type="button"
                    className="font-medium hover:opacity-75 transition-opacity"
                    style={{ color: theme.primary }}
                    onClick={onClose}
                  >
                    Continue Shopping
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 