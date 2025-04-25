"use client";

import React from 'react';
import { CreditCard, Banknote, Truck } from 'lucide-react';

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
      icon: Banknote
    },
    {
      id: 'CARD',
      name: 'Credit Card',
      description: 'Coming soon - Pay with credit/debit card.',
      icon: CreditCard,
      disabled: true
    },
    {
      id: 'UPI',
      name: 'UPI Payment',
      description: 'Coming soon - Pay using UPI.',
      icon: Truck,
      disabled: true
    }
  ];

  const handleSelectPaymentMethod = (methodId: string) => {
    if (readOnly) return;
    const method = paymentMethods.find(m => m.id === methodId);
    if (method && !method.disabled) {
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
              method.disabled 
                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" 
                : paymentMethod === method.id 
                  ? "border-indigo-500 bg-indigo-50 cursor-pointer" 
                  : "border-gray-200 hover:border-gray-300 cursor-pointer"
            }`}
            onClick={() => handleSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center">
              <method.icon className={`h-5 w-5 ${method.disabled ? 'text-gray-300' : 'text-gray-500'} mr-3`} />
              <div>
                <div className="flex items-center">
                  <p className="font-medium">{method.name}</p>
                  {method.disabled && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Coming Soon
                    </span>
                  )}
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