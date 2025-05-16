"use client"
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { ChevronDown, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { TableSkeleton } from "@/components/admin/skeletons";

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

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "DELIVERED",
  "CANCELLED"
] as const;

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const router = useRouter();
  const { status } = useSession();

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/orders");
      setOrders(response.data);
      setError(null);
    } catch (error: unknown) {
      console.error("Error fetching orders:", error);
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setError("Failed to load orders. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [router, status, fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, {
        status: newStatus
      });
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "DELIVERED":
        return "bg-green-50 text-green-700 border border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (status === "loading" || isLoading) {
    return <TableSkeleton rows={6} columns={8} />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-6 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 mb-6 shadow-sm">
          <p className="text-center text-lg">{error}</p>
        </div>
        <div className="text-center">
          <button 
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No.
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Time
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{order.user.name}</div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="relative inline-block w-28">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className="w-full appearance-none pl-2 pr-7 py-1 rounded border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3 w-3 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                        title="View Invoice"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 