"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import Script from "next/script";
import AddressSelection from "@/components/checkout/AddressSelection";
import PaymentMethodSelection from "@/components/checkout/PaymentMethodSelection";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import RazorpayPayment from "@/components/checkout/RazorpayPayment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Add Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

const steps = ["Address", "Payment", "Review"];

interface CartItem {
  id: number;
  name: string;
  cartQuantity: number;
  price: number | string;
  images?: { url: string }[];
  originalProductId: string | number;
}

interface PaymentVerificationData {
  success: boolean;
  message: string;
  order: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, clearCartItems: clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  // Add canProceed logic
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Address step
        return !!selectedAddressId;
      case 1: // Payment step
        return !!paymentMethod;
      default:
        return true;
    }
  }, [currentStep, selectedAddressId, paymentMethod]);

  // Check if user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    }
  }, [status, router]);

  const fetchCartItems = useCallback(async () => {
    if (items.length === 0 && !isOrderComplete) {
      toast.error('Your cart is empty');
      router.push('/');
      setIsLoading(false);
      return;
    }

    if (items.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
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
        throw new Error('Invalid products data returned from API');
      }

      const itemsWithDetails = items
        .map(item => {
          const product = products.find((p: any) =>
            String(p.id) === String(item.id)
          );

          if (product) {
            return {
              ...product,
              cartQuantity: item.quantity,
              originalProductId: item.id
            };
          }
          return null;
        }).filter(Boolean) as CartItem[];

      setCartItems(itemsWithDetails);
      
      // Calculate subtotal
      const total = itemsWithDetails.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.cartQuantity);
      }, 0);
      
      setSubtotal(total);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
      if (!isOrderComplete) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [items, router, isOrderComplete]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedItems = cartItems.map(item => ({
        productId: item.originalProductId,
        quantity: item.cartQuantity,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: formattedItems,
          totalAmount: subtotal,
          shippingAddressId: selectedAddressId,
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }

      // Return the order ID for Razorpay verification
      return data.id;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add payment success/error handlers
  const handlePaymentSuccess = async (paymentData: PaymentVerificationData) => {
    setIsOrderComplete(true);
    clearCart();
    toast.success('Payment successful! Order placed.');
    router.replace("/account?tab=orders");
  };

  const handlePaymentError = (error: Error) => {
    toast.error(`Payment failed: ${error.message}`);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onError={() => {
          toast.error("Failed to load payment system");
        }}
      />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      
      <div className="mb-8">
        <CheckoutSteps steps={steps} currentStep={currentStep} />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          {currentStep === 0 && (
            <AddressSelection 
              selectedAddressId={selectedAddressId} 
              setSelectedAddressId={setSelectedAddressId} 
            />
          )}
          
          {currentStep === 1 && (
            <PaymentMethodSelection 
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod} 
            />
          )}
          
          {currentStep === 2 && (
            <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Review</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
                  <AddressSelection 
                    selectedAddressId={selectedAddressId} 
                    setSelectedAddressId={setSelectedAddressId}
                    readOnly
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                  <PaymentMethodSelection 
                    paymentMethod={paymentMethod} 
                    setPaymentMethod={setPaymentMethod}
                    readOnly
                  />
                </div>

                <div className="mt-6">
                  {paymentMethod === 'COD' ? (
                    <button
                      onClick={async () => {
                        try {
                          await handleCreateOrder();
                          setIsOrderComplete(true);
                          clearCart();
                          toast.success('Order placed successfully!');
                          router.replace("/account?tab=orders");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Failed to process order');
                        }
                      }}
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Processing...</span>
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={subtotal}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      onCreateOrder={handleCreateOrder}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePreviousStep}
              className={`${
                currentStep > 0 ? '' : 'invisible'
              } bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Back
            </button>

            {/* Only show next button if not on review step */}
            {currentStep < 2 && (
              <button
                onClick={handleNextStep}
                disabled={isSubmitting || !canProceed}
                className={`${
                  currentStep > 0 ? 'ml-auto' : ''
                } bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  'Next'
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <OrderSummary 
            items={cartItems.filter(item => item.cartQuantity > 0)} 
            subtotal={subtotal} 
          />
        </div>
      </div>
    </div>
  );
} 