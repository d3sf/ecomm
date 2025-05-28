"use client";

import { CreditCard, Banknote } from "lucide-react";

interface PaymentMethodSelectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  readOnly?: boolean;
}

export default function PaymentMethodSelection({
  paymentMethod,
  setPaymentMethod,
  readOnly = false,
}: PaymentMethodSelectionProps) {
  const paymentMethods = [
    {
      id: "COD",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: Banknote,
    },
    {
      id: "RAZORPAY",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-4">
      {!readOnly && (
        <h2 className="text-lg font-medium text-gray-900">Select Payment Method</h2>
      )}

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
              paymentMethod === method.id
                ? "border-indigo-500 ring-2 ring-indigo-500"
                : "border-gray-300"
            }`}
            onClick={() => !readOnly && setPaymentMethod(method.id)}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="flex items-center">
                    <method.icon className="h-5 w-5 text-gray-900 mr-3" />
                    <p className="font-medium text-gray-900">{method.name}</p>
                  </div>
                  <p className="text-gray-500">{method.description}</p>
                </div>
              </div>
              {paymentMethod === method.id && (
                <div className="shrink-0 text-indigo-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 