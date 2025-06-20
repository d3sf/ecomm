"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddressForm from "@/components/address/AddressForm";
import AddressCard from "@/components/address/AddressCard";
import { Address } from "@/types/address";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAddresses } from "@/contexts/AddressContext";

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
  const { addresses, isLoading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAddressSave = async (address: Address) => {
    try {
      await addAddress(address);
      setShowAddressForm(false);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const handleAddressEdit = (id: number) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (addressToEdit) {
      setEditingAddress(addressToEdit);
      setShowAddressForm(true);
    }
  };

  const handleAddressDelete = async (id: number) => {
    try {
      await deleteAddress(id);
      if (selectedAddressId === id) {
        setSelectedAddressId(0);
      }
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const handleAddressUpdate = async (address: Address) => {
    try {
      await updateAddress(address);
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  // If in readOnly mode, only show the selected address
  if (readOnly) {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <AddressCard
          address={selectedAddress}
          readOnly={true}
          onEdit={() => {}}
          onDelete={() => {}}
          onSetDefault={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            onClick={() => setSelectedAddressId(address.id!)}
          >
            <AddressCard
              address={address}
              onEdit={handleAddressEdit}
              onDelete={handleAddressDelete}
              onSetDefault={handleSetDefault}
              readOnly={false}
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