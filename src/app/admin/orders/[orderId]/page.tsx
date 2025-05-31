"use client"
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { use } from "react";

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  orderItems: {
    id: number;
    product: {
      id: number;
      name: string;
      images: { url: string }[];
    };
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { status } = useSession();
  const { orderId } = use(params);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/orders/${orderId}`);
      setOrder(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }

    if (status === "authenticated") {
      fetchOrder();
    }
  }, [router, status, fetchOrder]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-6 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 mb-6 shadow-sm">
          <p className="text-center text-lg">{error || "Order not found"}</p>
        </div>
        <div className="text-center">
          <button 
            onClick={() => router.push("/admin/orders")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-content,
          .invoice-content * {
            visibility: visible;
          }
          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header with actions */}
      <div className="flex justify-between items-center mb-8 no-print">
        <button
          onClick={() => router.push("/admin/orders")}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 invoice-content">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
            <p className="text-gray-500">Order #{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Date</p>
            <p className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Customer and Shipping Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-sm font-medium text-gray-900 mb-2">Customer</h2>
            <p className="text-gray-900">{order.user.name}</p>
            <p className="text-gray-500">{order.user.email}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h2>
            <p className="text-gray-900">{order.shippingAddress.fullName}</p>
            <p className="text-gray-500">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && <br />}
              {order.shippingAddress.addressLine2}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Order Items</h2>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-gray-500">Item</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-500">Quantity</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-500">Price</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pl-4 pr-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-200 overflow-hidden">
                          <Image
                            src={item.product.images[0]?.url || "/placeholder.png"}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{item.product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-3 py-4 text-right text-sm text-gray-500">₹{item.price.toFixed(2)}</td>
                    <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 