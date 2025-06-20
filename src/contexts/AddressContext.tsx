import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Address } from '@/types/address';

interface AddressContextType {
  addresses: Address[];
  isLoading: boolean;
  refetchAddresses: () => Promise<void>;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = async () => {
    if (!session) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchAddresses();
  }, [session]);

  const addAddress = async (address: Address) => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });

      if (!response.ok) throw new Error("Failed to save address");
      const savedAddress = await response.json();
      setAddresses((prev) => [...prev, savedAddress]);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
      throw error;
    }
  };

  const updateAddress = async (address: Address) => {
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
      toast.success("Address updated successfully");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
      throw error;
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete address");
      setAddresses((prev) => prev.filter(addr => addr.id !== id));
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
      throw error;
    }
  };

  const setDefaultAddress = async (id: number) => {
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
      throw error;
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        isLoading,
        refetchAddresses: fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressProvider');
  }
  return context;
} 