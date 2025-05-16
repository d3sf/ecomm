"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import AddressSelection from "./components/AddressSelection";
import PaymentMethodSelection from "./components/PaymentMethodSelection";
import OrderSummary from "./components/OrderSummary";
import CheckoutSteps from "./components/CheckoutSteps";
import RazorpayPayment from "./components/RazorpayPayment";
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

interface PaymentVerificationData {
  success: boolean;
  message: string;
  order: Record<string, unknown>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, clearCart } = useCart();
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

  // Fetch cart items
  useEffect(() => {
    // Skip the empty cart check if an order was just completed
    if (items.length === 0 && !isOrderComplete) {
      router.push("/");
      toast.error("Your cart is empty");
      return;
    }
    
    // Skip API calls if an order was just completed
    if (isOrderComplete) {
      return;
    }
    
    const fetchCartItems = async () => {
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
          // Only show error if not during order completion
          if (!isOrderComplete) {
            throw new Error('Failed to fetch products');
          }
          return;
        }
        
        const { products } = await response.json();
        
        if (!products || !Array.isArray(products)) {
          console.error('Invalid products data returned from API');
          toast.error('Failed to load cart items');
          return;
        }

        const itemsWithDetails = items.map(item => {
          const product = products.find((p: { id: number | string }) => String(p.id) === String(item.productId));
          if (product) {
            return {
              ...product,
              cartQuantity: item.quantity,
              originalProductId: item.productId
            };
          }
          return null;
        }).filter(Boolean) as CartItem[];

        if (itemsWithDetails.length === 0) {
          toast.error('Could not find products in your cart. Please try again.');
          router.push('/');
          return;
        }
        
        setCartItems(itemsWithDetails);
        
        // Calculate subtotal
        let total = 0;
        for (const item of itemsWithDetails) {
          const price = typeof item.price === 'string'
            ? parseFloat(item.price)
            : item.price;
          total += price * item.cartQuantity;
        }
        setSubtotal(total);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        // Only show error toast if not during order completion
        if (!isOrderComplete) {
          toast.error('Failed to load cart items');
          router.push('/');
        }
      }
    };

    fetchCartItems();
  }, [items, router]);

  const handleNextStep = () => {
    if (currentStep === 0 && !selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    if (currentStep === 1 && !paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (currentStep === 1 && paymentMethod === 'RAZORPAY') {
      toast.error('Razorpay payments are currently unavailable');
      return;
    }

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

      if (paymentMethod === 'COD') {
        // Mark order as complete to prevent empty cart message
        setIsOrderComplete(true);
        // Show success message
        toast.success('Order placed successfully!');
        // Clear cart
        clearCart();
        // Navigate to order page
        router.push(`/orders/${data.id}`);
      } else if (paymentMethod === 'RAZORPAY') {
        // Proceed to payment step with Razorpay
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'COD') {
      handleCreateOrder();
    } else if (paymentMethod === 'RAZORPAY') {
      if (!orderId) {
        // Create order first
        await handleCreateOrder();
      }
    }
  };

  const handlePaymentSuccess = (paymentData: PaymentVerificationData) => {
    clearCart();
    toast.success(`Payment successful! ${paymentData.message}`);
    router.push(`/orders/${orderId}`);
  };

  const handlePaymentError = (error: Error) => {
    toast.error(`Payment failed: ${error.message}`);
    // You could redirect to a payment failure page or stay on checkout
  };

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

                  {/* Razorpay Payment Button */}
                  {paymentMethod === 'RAZORPAY' && orderId && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Complete Payment</h3>
                      <RazorpayPayment 
                        orderId={orderId} 
                        amount={subtotal}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    </div>
                  )}
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
                  disabled={isSubmitting || (paymentMethod === 'RAZORPAY')}
                  className={`${currentStep > 0 ? 'ml-auto' : ''} bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50`}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <OrderSummary items={cartItems} subtotal={subtotal} />
          </div>
        </div>
      </div>
    </div>
  );
} 