"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import AccountTabs from "@/components/account/AccountTabs";
import OrderCard from "@/components/order/OrderCard";
import OrderDetailsView from "@/components/order/OrderDetailsView";
import AddressCard from "@/components/address/AddressCard";
import AddressForm from "@/components/address/AddressForm";
import { Order } from "@/types/order";
import { User, UserCircle } from "lucide-react";

interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  addressLabel: "HOME" | "WORK" | "OTHER";
  customLabel?: string;
}

export default function AccountPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/addresses");
      if (!response.ok) throw new Error("Failed to fetch addresses");
      const data = await response.json();
      setAddresses(data);
    } catch {
      toast.error("Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "addresses") {
        fetchAddresses();
      }
    }
  }, [status, activeTab, fetchOrders, fetchAddresses]);

  const handleViewOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order details");
      const data = await response.json();
      setSelectedOrder(data);
    } catch {
      toast.error("Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (!response.ok) throw new Error("Failed to download invoice");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  const handleAddAddress = () => {
    setIsAddingAddress(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
  };

  const handleEditAddressById = (id: number) => {
    const address = addresses.find(addr => addr.id === id);
    if (address) {
      setEditingAddress(address);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete address");
      await fetchAddresses();
      toast.success("Address deleted successfully");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to set default address");
      await fetchAddresses();
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to set default address");
    }
  };

  const handleSaveAddress = async (address: Omit<Address, "id"> & { id?: number }) => {
    try {
      const url = address.id ? `/api/addresses/update?id=${address.id}` : "/api/addresses";
      const method = address.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error("Failed to save address");
      await fetchAddresses();
      setIsAddingAddress(false);
      setEditingAddress(null);
      toast.success(address.id ? "Address updated" : "Address added");
    } catch {
      toast.error("Failed to save address");
    }
  };

  const handleCancelAddress = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Account</h1>

      <AccountTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="mt-8">
        {activeTab === "profile" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{session?.user?.name}</h2>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{session?.user?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <p className="text-gray-900">{session?.user?.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <p className="text-gray-900">Customer Account</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            {selectedOrder ? (
              <OrderDetailsView
                order={selectedOrder}
                onBack={handleBackToOrders}
                onDownloadInvoice={() => handleDownloadInvoice(selectedOrder.id)}
              />
            ) : (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onView={() => handleViewOrder(order.id)}
                      onDownloadInvoice={() => handleDownloadInvoice(order.id)}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">No orders found</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            {isAddingAddress || editingAddress ? (
              <div className="bg-white shadow rounded-lg p-6">
                <AddressForm
                  initialData={editingAddress || undefined}
                  onSave={handleSaveAddress}
                  onCancel={handleCancelAddress}
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-6">
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add New Address
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={handleEditAddressById}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefaultAddress}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No addresses found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 