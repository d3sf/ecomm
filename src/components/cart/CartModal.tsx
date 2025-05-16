"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ProductType } from "@/lib/zodvalidation";
import AddToCartButton from "./AddToCartButton";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemWithDetails extends Omit<ProductType, 'quantity'> {
  cartQuantity: number;
  originalProductId: string | number;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, addToCart } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update subtotal whenever cart items change
  useEffect(() => {
    const visibleItems = cartItems.filter(item => item.cartQuantity > 0);

    if (visibleItems.length === 0) {
      setSubtotal(0);
      return;
    }

    let total = 0;
    for (const item of visibleItems) {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price)
        : item.price;
      total += price * item.cartQuantity;
    }
    setSubtotal(total);
  }, [cartItems]);

  const fetchCartItems = useCallback(async () => {
    if (items.length === 0) {
      setCartItems([]);
      return;
    }
    
    try {
      // Extract product IDs from cart items
      const productIds = items.map(item => item.productId);
      
      // Use the dedicated cart-products API to fetch only the products in the cart
      const response = await fetch('/api/cart-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
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
          String(p.id) === String(item.productId)
        );

        if (product) {
          const { ...productWithoutQuantity } = product;
          return {
            ...productWithoutQuantity,
            cartQuantity: item.quantity,
            originalProductId: item.productId
          };
        }
        return null;
      }).filter(Boolean) as CartItemWithDetails[];

      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    }
  }, [items]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleProceedToCheckout = useCallback(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onClose();
    router.push('/checkout');
  }, [items.length, onClose, router]);

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
        <div className="w-screen max-w-md" style={{ height: '100vh' }}>
          <div className="flex flex-col bg-white shadow-xl" style={{ height: '100vh' }}>
            {/* Header - Fixed height */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-6 border-b bg-white">
              <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items - Flexible height with scrolling */}
            <div className="flex-grow overflow-y-auto px-4 py-6">
              {items.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {cartItems.filter(item => item.cartQuantity > 0).map((item) => (
                    <li key={`cart-item-${item.id}`} className="flex py-6">
                      {/* Product Image */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={item.images?.[0]?.url || "/placeholder.png"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            {/* Quantity Controls */}
                            <div className="mt-2">
                              <AddToCartButton
                                key={`button-${item.id}-${item.cartQuantity}`}
                                productId={item.originalProductId}
                                onAddToCart={addToCart}
                                initialQuantity={item.cartQuantity}
                              />
                            </div>
                            <p className="ml-4">
                              ₹{typeof item.price === 'string'
                                ? parseFloat(item.price).toFixed(2)
                                : item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer - Fixed height */}
            <div className="flex-shrink-0 border-t border-gray-200 px-4 py-6 bg-white">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>
                  ₹{subtotal.toFixed(2)}
                </p>
              </div>
              <div className="mt-6">
                <button
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleProceedToCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 