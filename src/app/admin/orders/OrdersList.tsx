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

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const fetchOrders = async () => {
        try {
          const response = await axios.get("/api/admin/orders");
          setOrders(response.data);
          setError(null);
        } catch (error: unknown) {
          console.error("Error fetching orders:", error);
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            // Redirect to login page if unauthorized
            router.push("/admin/login");
          } else {
            setError("Failed to load orders. Please try again later.");
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    }
  }, [router, status]);

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
            <th className="py-2">Status</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="py-2">{order.id}</td>
              <td className="py-2">{order.user.name} ({order.user.email})</td>
              <td className="py-2">₹{order.totalAmount.toFixed(2)}</td>
              <td className="py-2">{order.status}</td>
              <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 