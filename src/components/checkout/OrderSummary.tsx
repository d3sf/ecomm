"use client";

import Image from "next/image";
import { formatCurrency } from "@/utils/currency";

interface CartItem {
  id: number;
  name: string;
  cartQuantity: number;
  price: number | string;
  images?: { url: string }[];
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
}

export default function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Calculate item price accounting for string or number
  const getItemPrice = (price: string | number, quantity: number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return formatCurrency(numPrice * quantity);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
        
        <div className="flow-root">
          <ul className="-my-6 divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="py-6 flex">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name}</h3>
                      <p className="ml-4">
                        {getItemPrice(item.price, item.cartQuantity)}
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
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>{formatCurrency(subtotal)}</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
            <p>Shipping</p>
            <p>Free</p>
          </div>
          <div className="flex justify-between text-lg font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
            <p>Total</p>
            <p>{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 