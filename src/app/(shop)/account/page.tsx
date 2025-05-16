"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Package, MapPin, User, Download, Edit2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import AddressForm from "@/components/address/AddressForm";

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

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [name, setName] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const newAddress: Omit<Address, 'id'> = {
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
    addressLabel: "HOME",
    customLabel: "",
  };

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await fetch("/api/addresses");
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session, fetchAddresses]);

  useEffect(() => {
    if (session && activeTab === "orders") {
      fetchOrders();
    }
  }, [session, activeTab, fetchOrders]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Initialize name from session if not already set
  if (!name && session.user?.name) {
    setName(session.user.name);
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/user/profile", { name });
      if (response.status === 200) {
        toast.success("Profile updated successfully");
        // Update the local state with the new name
        setName(response.data.name);
        // Refresh the session to get the updated name
        await router.refresh();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleAddAddress = async (addressData: Omit<Address, 'id'>) => {
    try {
      const { data: savedAddress } = await axios.post("/api/addresses", addressData);
      setAddresses([...addresses, savedAddress]);
      setIsAddingAddress(false);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
      throw error;
    }
  };

  const handleUpdateAddress = async (addressData: Address) => {
    try {
      const response = await fetch(`/api/addresses/update?id=${addressData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update address");
      }

      // Refresh the addresses list
      fetchAddresses();
      setEditingAddressId(null);
      toast.success("Address updated successfully");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
      throw error;
    }
  };

  const handleEditAddress = (address: Address) => {
    // Set the address being edited
    setEditingAddressId(address.id);
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete address");
      }

      // Refresh the addresses list
      fetchAddresses();
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to set default address");
      }

      // Refresh the addresses list
      fetchAddresses();
      toast.success("Default address updated successfully");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    }
  };

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download invoice');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel */}
          <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-8">
              {/* <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">
                    {session.user?.name?.[0] || "U"}
                  </span>
                )}
              </div> */}
              <div>
                <h2 className="text-xl font-semibold">{session.user?.name}</h2>
                {session.user?.email && (
                  <p className="text-gray-500 flex items-center gap-2">
                    <span className="text-gray-400">Email:</span>
                    {session.user.email}
                  </p>
                )}
                {session.user?.phone && (
                  <p className="text-gray-500 flex items-center gap-2">
                    <span className="text-gray-400">Phone:</span>
                    {session.user.phone}
                  </p>
                )}
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === "orders"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Package size={18} />
                Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === "addresses"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <MapPin size={18} />
                Addresses
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === "profile"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <User size={18} />
                Profile
              </button>
            </nav>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow p-6">
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Your Orders</h3>
                {isLoadingOrders ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">No orders found</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-sm ${order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-4"
                            >
                              <div className="w-16 h-16 relative">
                                <Image
                                  src={item.product.images[0]?.url || "/placeholder.png"}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">Shipping Address:</p>
                            <p className="text-sm">
                              {order.shippingAddress.fullName},{" "}
                              {order.shippingAddress.addressLine1},{" "}
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state} -{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-gray-500">Total Amount:</p>
                            <div className="flex items-center gap-4">
                              <p className="font-medium">₹{order.totalAmount}</p>
                              <button
                                onClick={() => handleDownloadInvoice(order.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Addresses</h3>
                  <button
                    onClick={() => {
                      setIsAddingAddress(true);
                      setEditingAddressId(null);
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    Add New Address
                  </button>
                </div>

                {isAddingAddress && !editingAddressId && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium mb-4">Add New Address</h4>
                    <AddressForm
                      onCancel={() => setIsAddingAddress(false)}
                      onSubmit={handleAddAddress}
                      initialData={newAddress}
                    />
                  </div>
                )}

                {editingAddressId && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium mb-4">Edit Address</h4>
                    {addresses.filter(addr => addr.id === editingAddressId).map(address => (
                      <AddressForm
                        key={address.id}
                        onCancel={() => setEditingAddressId(null)}
                        onSubmit={(data) => handleUpdateAddress({...data, id: address.id})}
                        initialData={address}
                        isEditing={true}
                      />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {address.phoneNumber}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-sm ${address.addressLabel === "HOME"
                              ? "bg-blue-100 text-blue-800"
                              : address.addressLabel === "WORK"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {address.addressLabel === "OTHER"
                            ? address.customLabel
                            : address.addressLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.postalCode}
                      </p>
                      <div className="mt-4 flex justify-end gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Set as Default
                          </button>
                        )}
                        {address.isDefault && (
                          <span className="text-sm text-green-600">
                            Default Address
                          </span>
                        )}
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <Edit2 size={14} className="inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-40 font-medium">Full Name</label>
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="w-40 font-medium">Email</label>
                    <input
                      type="email"
                      className="flex-1 p-2 border border-gray-300 rounded bg-gray-50"
                      value={session.user?.email || ""}
                      readOnly
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="w-40 font-medium">Phone</label>
                    <input
                      type="tel"
                      className="flex-1 p-2 border border-gray-300 rounded bg-gray-50"
                      value={session.user?.phone || ""}
                      readOnly
                    />
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

