"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import AddressForm from '@/components/address/AddressForm';

interface Address {
  id: number;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressSelectionProps {
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number) => void;
  readOnly?: boolean;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ 
  selectedAddressId, 
  setSelectedAddressId,
  readOnly = false
}) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleAddAddress = useCallback(async (formData: {
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
  }) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add address');

      const newAddress = await response.json();
      setAddresses(prev => [...prev, newAddress]);
      setSelectedAddressId(newAddress.id);
      setIsAddingAddress(false);
      toast.success('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  }, [setSelectedAddressId]);

  const handleSelectAddress = useCallback((addressId: number) => {
    if (readOnly) return;
    setSelectedAddressId(addressId);
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
    }
  }, [readOnly, setSelectedAddressId, addresses]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/addresses');
        if (!response.ok) throw new Error('Failed to fetch addresses');
        const data = await response.json();
        setAddresses(data);
        
        // Set default address if available and no address is selected
        if (!selectedAddressId) {
          const defaultAddress = data.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.length > 0) {
            setSelectedAddressId(data[0].id);
          }
        }

        // Find the selected address details
        if (selectedAddressId) {
          const address = data.find((addr: Address) => addr.id === selectedAddressId);
          if (address) {
            setSelectedAddress(address);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [session, selectedAddressId, setSelectedAddressId]);

  if (isLoading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (readOnly && selectedAddress) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <div className="p-4 border rounded-lg border-gray-200">
          <p className="font-medium">{selectedAddress.fullName}</p>
          <p className="text-sm text-gray-500">{selectedAddress.addressLine1}</p>
          {selectedAddress.addressLine2 && (
            <p className="text-sm text-gray-500">{selectedAddress.addressLine2}</p>
          )}
          <p className="text-sm text-gray-500">
            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
        {!isAddingAddress && (
          <button
            onClick={() => setIsAddingAddress(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Address
          </button>
        )}
      </div>

      {isAddingAddress ? (
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">Add New Address</h4>
          <AddressForm
            onCancel={() => setIsAddingAddress(false)}
            onSave={handleAddAddress}
          />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">You don&apos;t have any saved addresses.</p>
          <button
            onClick={() => setIsAddingAddress(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedAddressId === address.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelectAddress(address.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-sm text-gray-500">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-sm text-gray-500">{address.addressLine2}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
                {address.isDefault && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSelection; 