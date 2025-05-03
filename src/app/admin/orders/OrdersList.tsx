"use client"
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }

    // Only fetch if authenticated
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [router, status]);

  const fetchOrders = async () => {
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
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, {
        status: newStatus
      });
      
      // Update the local state
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
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "DELIVERED":
        return "bg-green-50 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  // Show loading while session is being fetched
  if (status === "loading" || isLoading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 mb-4">
          {error}
        </div>
        <button 
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Order ID</th>
            <th className="py-2">Customer</th>
            <th className="py-2">Total Amount</th>
            <th className="py-2">Payment Method</th>
            <th className="py-2">Status</th>
            <th className="py-2">Action</th>
            <th className="py-2">Order Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="py-2">{order.id}</td>
              <td className="py-2">{order.user.name} ({order.user.email})</td>
              <td className="py-2">₹{order.totalAmount.toFixed(2)}</td>
              <td className="py-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-800 border-gray-200">
                  {order.paymentMethod}
                </span>
              </td>
              <td className="py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-2">
                <div className="flex items-center justify-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingStatus === order.id}
                    className="px-2 py-1 rounded border border-gray-300 bg-white"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingStatus === order.id && (
                    <span className="ml-2 text-sm text-gray-500">Updating...</span>
                  )}
                </div>
              </td>
              <td className="py-2">
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 