"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";
import AddressForm from "@/components/address/AddressForm";
import AddressCard from "@/components/address/AddressCard";
import { Address } from "@/types/address";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AddressSelectionProps {
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number) => void;
  readOnly?: boolean;
}

export default function AddressSelection({
  selectedAddressId,
  setSelectedAddressId,
  readOnly = false,
}: AddressSelectionProps) {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch("/api/addresses");
        if (!response.ok) throw new Error("Failed to fetch addresses");
        const data = await response.json();
        setAddresses(data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load addresses");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchAddresses();
    }
  }, [session]);

  const handleAddressSave = async (address: Address) => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });

      if (!response.ok) throw new Error("Failed to save address");
      const savedAddress = await response.json();
      setAddresses((prev) => [...prev, savedAddress]);
      setShowAddressForm(false);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    }
  };

  const handleAddressEdit = async (id: number) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (addressToEdit) {
      setEditingAddress(addressToEdit);
      setShowAddressForm(true);
    }
  };

  const handleAddressDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete address");
      
      setAddresses((prev) => prev.filter(addr => addr.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(0);
      }
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleAddressUpdate = async (address: Address) => {
    try {
      const response = await fetch(`/api/addresses/${address.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });

      if (!response.ok) throw new Error("Failed to update address");
      const updatedAddress = await response.json();
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === address.id ? updatedAddress : addr))
      );
      setShowAddressForm(false);
      setEditingAddress(null);
      toast.success("Address updated successfully");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error("Failed to set default address");
      
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      toast.success("Default address updated");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Select Shipping Address</h2>
          <button
            onClick={() => setShowAddressForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </button>
        </div>
      )}

      {showAddressForm && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <AddressForm
            onSave={editingAddress ? handleAddressUpdate : handleAddressSave}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
            initialData={editingAddress}
          />
        </div>
      )}

      <div className="grid gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`cursor-pointer ${
              selectedAddressId === address.id ? "ring-2 ring-indigo-500" : ""
            }`}
            onClick={() => !readOnly && setSelectedAddressId(address.id!)}
          >
            <AddressCard
              address={address}
              onEdit={handleAddressEdit}
              onDelete={handleAddressDelete}
              onSetDefault={handleSetDefault}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>

      {addresses.length === 0 && !showAddressForm && (
        <div className="text-center py-12">
          <p className="text-gray-500">No addresses found. Add a new address to continue.</p>
        </div>
      )}
    </div>
  );
} 