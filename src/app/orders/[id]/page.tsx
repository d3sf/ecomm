"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    images: { url: string }[];
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

// Next.js 15 params handling
export default function OrderPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Order Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Order #{order.id}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Ordered on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Order Items */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-6">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 border-b border-gray-200 pb-4"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.png"}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-sm text-gray-500">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-sm text-gray-500">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Order Total</h2>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 