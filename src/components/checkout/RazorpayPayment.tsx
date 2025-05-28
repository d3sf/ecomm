"use client";

import { useEffect } from "react";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayPaymentProps {
  orderId: number;
  amount: number;
  onPaymentSuccess: (data: { success: boolean; message: string; order: RazorpayResponse }) => void;
  onPaymentError: (error: Error) => void;
}

type RazorpayConstructor = {
  new (options: RazorpayOptions): {
    open: () => void;
  };
};

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

export default function RazorpayPayment({
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}: RazorpayPaymentProps) {
  useEffect(() => {
    const loadRazorpay = async () => {
      try {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          initializeRazorpay();
        };
      } catch (error) {
        console.error("Error loading Razorpay:", error);
        onPaymentError(new Error("Failed to load payment gateway"));
      }
    };

    loadRazorpay();
  }, [orderId, amount]);

  const initializeRazorpay = () => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      onPaymentError(new Error("Razorpay key not found"));
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "QuickShop",
      description: `Order #${orderId}`,
      order_id: orderId.toString(), // Convert number to string
      handler: function (response: RazorpayResponse) {
        onPaymentSuccess({
          success: true,
          message: "Payment successful!",
          order: response,
        });
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#4F46E5",
      },
      modal: {
        ondismiss: () => {
          onPaymentError(new Error("Payment cancelled"));
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      onPaymentError(new Error("Failed to initialize payment gateway"));
    }
  };

  return (
    <button
      onClick={initializeRazorpay}
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Pay Now
    </button>
  );
} 