"use client";

import React from 'react';
import Image from 'next/image';

interface OrderItem {
  id: number;
  name: string;
  cartQuantity: number;
  price: number | string;
  images?: { url: string }[];
}

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, subtotal }) => {
  // Shipping cost could be calculated based on order value or weight
  const shippingCost = subtotal >= 500 ? 0 : 30;
  // Calculate tax (e.g., 18% GST)
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  // Total cost
  const totalCost = subtotal + shippingCost + taxAmount;

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 sticky top-4">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
      
      <div className="flow-root">
        <ul className="-my-4 divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="flex py-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={item.images?.[0]?.url || "/placeholder.png"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{item.name}</h3>
                    <p className="ml-4">
                      ₹{typeof item.price === 'string'
                        ? parseFloat(item.price).toFixed(2)
                        : item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">Qty {item.cartQuantity}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-gray-200 mt-6 pt-6">
        <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
          <p>Subtotal</p>
          <p>₹{subtotal.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <p>Shipping</p>
          <p>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</p>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mb-6">
          <p>Tax (18% GST)</p>
          <p>₹{taxAmount.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between text-base font-medium text-gray-900 border-t border-gray-200 pt-4">
          <p>Total</p>
          <p>₹{totalCost.toFixed(2)}</p>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          Shipping and taxes calculated at checkout.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary; 