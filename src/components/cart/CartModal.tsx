"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ProductType } from "@/lib/zodvalidation";
import AddToCartButton from "./AddToCartButton";
import { useSession } from "next-auth/react";
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

interface Address {
  id: number;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, addToCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

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
      // Use item.cartQuantity directly from our stored data
      total += price * item.cartQuantity;
    }
    setSubtotal(total);
  }, [cartItems]);

  useEffect(() => {
    // Fetch product details for each cart item
    const fetchCartItems = async () => {
      try {
        const response = await fetch('/api/products');
        const { products } = await response.json();

        const itemsWithDetails = items.map(item => {
          // Find the matching product
          const product = products.find((p: ProductType) =>
            String(p.id) === String(item.productId)
          );

          if (product) {
            const { ...productWithoutQuantity } = product;
            // Store the original productId from the cart context to ensure proper updates
            return {
              ...productWithoutQuantity,
              cartQuantity: item.quantity,
              // Store the original productId to ensure we're using the exact same reference 
              originalProductId: item.productId
            };
          }
          return null;
        }).filter(Boolean) as CartItemWithDetails[];

        setCartItems(itemsWithDetails);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [items]);

  useEffect(() => {
    // Fetch user addresses
    const fetchAddresses = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/addresses');
        if (!response.ok) throw new Error('Failed to fetch addresses');
        const data = await response.json();
        setAddresses(data);
        
        // Set default address if available
        const defaultAddress = data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
      }
    };

    fetchAddresses();
  }, [session]);

  // Use the direct addToCart function from context to ensure state consistency
  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? "block" : "hidden"
        }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 border-b">
              <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
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

            {/* Shipping Address Selection */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No addresses found. Please add an address in your account settings.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 border rounded-lg cursor-pointer ${
                          selectedAddressId === address.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-sm text-gray-500">{address.addressLine1}</p>
                            {address.addressLine2 && (
                              <p className="text-sm text-gray-500">{address.addressLine2}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                          </div>
                          {address.isDefault && (
                            <span className="text-xs font-medium text-indigo-600">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>
                  ₹{subtotal.toFixed(2)}
                </p>
              </div>
              <div className="mt-6">
                <button
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (items.length === 0) {
                      toast.error('Your cart is empty');
                      return;
                    }
                    
                    onClose();
                    router.push('/checkout');
                  }}
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