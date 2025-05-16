"use client";

import React from 'react';
import { CreditCard, Banknote } from 'lucide-react';

interface PaymentMethodSelectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  readOnly?: boolean;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  readOnly = false
}) => {
  const paymentMethods = [
    {
      id: 'COD',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives.',
      icon: Banknote,
      disabled: false
    },
    {
      id: 'RAZORPAY',
      name: 'Razorpay (Coming Soon)',
      description: 'Pay securely with credit/debit card, UPI, or net banking via Razorpay.',
      icon: CreditCard,
      disabled: true
    }
  ];

  const handleSelectPaymentMethod = (methodId: string, disabled: boolean) => {
    if (readOnly || disabled) return;
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      setPaymentMethod(methodId);
    }
  };

  // If in readonly mode, just show the selected payment method
  if (readOnly) {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (selectedMethod) {
      return (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <div className="p-4 border rounded-lg border-gray-200">
            <div className="flex items-center">
              <selectedMethod.icon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="font-medium">{selectedMethod.name}</p>
                <p className="text-sm text-gray-500">{selectedMethod.description}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-lg ${
              paymentMethod === method.id 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-gray-200 hover:border-gray-300"
            } ${
              method.disabled 
                ? "opacity-50 cursor-not-allowed" 
                : "cursor-pointer"
            }`}
            onClick={() => handleSelectPaymentMethod(method.id, method.disabled)}
          >
            <div className="flex items-center">
              <method.icon className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <div className="flex items-center">
                  <p className="font-medium">{method.name}</p>
                </div>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelection; 