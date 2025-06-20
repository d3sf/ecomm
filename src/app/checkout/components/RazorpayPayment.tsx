"use client";

import React from 'react';
import Script from 'next/script';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any; // Using any for now to avoid type conflicts
  }
}

interface RazorpayConstructor {
  new(options: RazorpayOptions): RazorpayInstance;
}

interface RazorpayInstance {
  open(): void;
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
  order: Record<string, unknown>;
}

interface RazorpayPaymentProps {
  orderId: number;
  amount: number;
  onPaymentSuccess: (paymentData: PaymentVerificationData) => void;
  onPaymentError: (error: Error) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const initializeRazorpay = async () => {
    if (!orderId) {
      toast.error("Order ID is required");
      return;
    }

    try {
      // Create Razorpay order
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      
      // Open Razorpay payment form
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.id,
        prefill: {
          name: data.prefillData.name,
          email: data.prefillData.email,
          contact: data.prefillData.contact,
        },
        handler: async function (response: RazorpayResponse) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: orderId,
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
            console.error("Payment verification error:", error);
            onPaymentError(error instanceof Error ? error : new Error(String(error)));
          }
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment cancelled");
          },
        },
        theme: {
          color: "#4F46E5", // Indigo-600 color
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      onPaymentError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => console.log("Razorpay SDK loaded")}
      />
      <button
        onClick={initializeRazorpay}
        className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Pay with Razorpay
      </button>
    </>
  );
};

export default RazorpayPayment; 