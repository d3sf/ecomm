"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Link from "next/link";


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
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
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
  });

  const fetchAddresses = async () => {
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
  };

  const fetchOrders = async () => {
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
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    if (session?.user?.phone) {
      setPhone(session.user.phone);
    }

    fetchAddresses();
    fetchOrders();
  }, [session]);

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

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement name update functionality
    console.log("Name updated:", name);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: savedAddress } = await axios.post("/api/addresses", newAddress);
      setAddresses([...addresses, savedAddress]);
      setIsAddingAddress(false);
      toast.success("Address saved successfully");

      // Reset form
      setNewAddress({
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
      });
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel */}
          <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
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
              </div>
              <div>
                <h2 className="text-xl font-semibold">{session.user?.name}</h2>
                <p className="text-gray-500">{session.user?.email}</p>
                <p className="text-gray-500">{session.user?.phone}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === "orders"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === "addresses"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Addresses
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === "profile"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Profile
              </button>
            </nav>
          </div>

          {/* Right Content */}
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow p-6">
            {activeTab === "orders" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Orders</h3>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === "PENDING" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : order.status === "COMPLETED" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {order.status}
                            </span>
                            <Link 
                              href={`/orders/${order.id}`}
                              className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-4 mt-2">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex items-center space-x-4">
                                <div className="h-16 w-16 flex-shrink-0">
                                  <Image
                                    src={item.product.images[0]?.url || "/placeholder.png"}
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover rounded"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">₹{item.price.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <p className="text-gray-500">Total Amount:</p>
                            <p className="text-lg font-medium">₹{order.totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Your Addresses</h3>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={newAddress.fullName}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, fullName: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={newAddress.phoneNumber}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, phoneNumber: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          value={newAddress.addressLine1}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, addressLine1: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={newAddress.addressLine2}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, addressLine2: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={newAddress.postalCode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, postalCode: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Address Label
                        </label>
                        <select
                          value={newAddress.addressLabel}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLabel: e.target.value as "HOME" | "WORK" | "OTHER" })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="HOME">Home</option>
                          <option value="WORK">Work</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      {newAddress.addressLabel === "OTHER" && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Custom Label
                          </label>
                          <input
                            type="text"
                            value={newAddress.customLabel}
                            onChange={(e) => setNewAddress({ ...newAddress, customLabel: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter custom label"
                            required
                          />
                        </div>
                      )}

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, isDefault: e.target.checked })
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Set as default address
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-gray-500">No addresses saved yet</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border rounded-lg p-4 relative"
                      >
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        <div className="space-y-1">
                          <p className="font-medium">{address.fullName}</p>
                          <p>{address.phoneNumber}</p>
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && <p>{address.addressLine2}</p>}
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            disabled={address.isDefault}
                            className={`text-sm ${address.isDefault
                              ? "text-gray-400"
                              : "text-indigo-600 hover:text-indigo-700"
                              }`}
                          >
                            Set as Default
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
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">This is your verified phone number used for login.</p>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

