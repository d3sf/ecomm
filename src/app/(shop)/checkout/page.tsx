"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import AddressSelection from "@/components/checkout/AddressSelection";
import PaymentMethodSelection from "@/components/checkout/PaymentMethodSelection";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
// import RazorpayPayment from "@/components/checkout/RazorpayPayment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const steps = ["Address", "Payment", "Review"];

interface CartItem {
  id: number;
  name: string;
  cartQuantity: number;
  price: number | string;
  images?: { url: string }[];
  originalProductId: string | number;
}

// Remove or comment out PaymentVerificationData interface since it's not needed
// interface PaymentVerificationData {
//   success: boolean;
//   message: string;
//   order: {
//     razorpay_payment_id: string;
//     razorpay_order_id: string;
//     razorpay_signature: string;
//   };
// }

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

  // Check if user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    }
  }, [status, router]);

  const fetchCartItems = useCallback(async () => {
    if (items.length === 0) {
      if (!isOrderComplete) {
        toast.error('Your cart is empty');
        router.push('/');
      }
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

      const itemsWithDetails = items.map(item => {
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

  const handleNextStep = () => {
    if (currentStep === 0 && !selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    if (currentStep === 1 && !paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Remove Razorpay check since it's not an option anymore
    // if (currentStep === 1 && paymentMethod === 'RAZORPAY') {
    //   toast.error('Razorpay payments are currently unavailable');
    //   return;
    // }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateOrder = async () => {
    if (!session?.user) {
      toast.error('Please sign in to checkout');
      router.push('/login');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      setCurrentStep(0);
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

      setOrderId(data.id);

      // Since Razorpay is removed, only handle COD
      // Mark order as complete to prevent empty cart message
      setIsOrderComplete(true);
      // Show success message
      toast.success('Order placed successfully!');
      // Clear cart
      clearCart();
      // Navigate to account page with orders section
      router.push("/account?tab=orders");
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Only COD is available now
    handleCreateOrder();
  };

  // Remove payment success/error handlers since they're not needed
  // const handlePaymentSuccess = (paymentData: PaymentVerificationData) => {
  //   clearCart();
  //   toast.success(`Payment successful! ${paymentData.message}`);
  //   router.push("/account?tab=orders");
  // };

  // const handlePaymentError = (error: Error) => {
  //   toast.error(`Payment failed: ${error.message}`);
  // };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                  {/* Remove Razorpay Payment Button */}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6">
              {currentStep > 0 && (
                <button
                  onClick={handlePreviousStep}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNextStep}
                  className={`${currentStep > 0 ? 'ml-auto' : ''} bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className={`${currentStep > 0 ? 'ml-auto' : ''} bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50`}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
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
    </div>
  );
} 