"use client";

import { useState } from "react";
import Script from "next/script";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

interface RazorpayPaymentProps {
  amount: number;
  onPaymentSuccess: (paymentData: PaymentVerificationData) => void;
  onPaymentError: (error: Error) => void;
  onCreateOrder: () => Promise<number>; // Should return the order ID
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  onCreateOrder
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initializeRazorpay = async () => {
    setIsSubmitting(true);
    
    try {
      // First initialize Razorpay payment
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      
      if (typeof window.Razorpay === 'undefined') {
        toast.error("Payment system not loaded. Please try again.");
        return;
      }

      const options: RazorpayOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.id,
        prefill: data.prefillData,
        handler: async function (response: RazorpayResponse) {
          try {
            // Create our order only after successful payment
            const orderId = await onCreateOrder();

            // Now verify the payment
            const verifyResponse = await fetch('/api/razorpay', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json();
              throw new Error(error.error || 'Payment verification failed');
            }

            const verificationData = await verifyResponse.json();
            onPaymentSuccess(verificationData as PaymentVerificationData);
          } catch (error) {
            onPaymentError(error instanceof Error ? error : new Error(String(error)));
          }
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment cancelled");
            setIsSubmitting(false);
          }
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onPaymentError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onError={() => {
          toast.error("Failed to load payment system");
        }}
      />
      <button
        onClick={initializeRazorpay}
        disabled={isSubmitting}
        className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2">Processing...</span>
          </div>
        ) : (
          'Make Payment'
        )}
      </button>
    </>
  );
};

export default RazorpayPayment; 