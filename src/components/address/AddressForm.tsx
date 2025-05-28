"use client";

import { useState } from "react";
import { X, Home, Building, Bookmark } from "lucide-react";

interface Address {
  id?: number;
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

interface AddressFormProps {
  onSave: (address: Address) => void;
  onCancel: () => void;
  initialData?: Address | null;
}

export default function AddressForm({ onSave, onCancel, initialData }: AddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    id: initialData?.id,
    addressLabel: initialData?.addressLabel || "HOME",
    customLabel: initialData?.customLabel,
    fullName: initialData?.fullName || "",
    phoneNumber: initialData?.phoneNumber || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postalCode: initialData?.postalCode || "",
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {initialData ? "Edit Address" : "Add New Address"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address Line 1
          </label>
          <input
            type="text"
            required
            value={formData.addressLine1}
            onChange={(e) =>
              setFormData({ ...formData, addressLine1: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) =>
              setFormData({ ...formData, addressLine2: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address Type
          </label>
          <div className="mt-2 flex space-x-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, addressLabel: "HOME" })}
              className={`flex flex-col items-center transition-colors duration-200 ${
                formData.addressLabel === "HOME"
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-indigo-500"
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, addressLabel: "WORK" })}
              className={`flex flex-col items-center transition-colors duration-200 ${
                formData.addressLabel === "WORK"
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-indigo-500"
              }`}
            >
              <Building className="w-6 h-6" />
              <span className="text-xs mt-1">Work</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, addressLabel: "OTHER" })}
              className={`flex flex-col items-center transition-colors duration-200 ${
                formData.addressLabel === "OTHER"
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-indigo-500"
              }`}
            >
              <Bookmark className="w-6 h-6" />
              <span className="text-xs mt-1">Other</span>
            </button>
          </div>
        </div>

        {formData.addressLabel === "OTHER" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custom Label
            </label>
            <input
              type="text"
              required
              value={formData.customLabel}
              onChange={(e) =>
                setFormData({ ...formData, customLabel: e.target.value })
              }
              className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              placeholder="Enter custom label"
            />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="defaultAddress"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData({ ...formData, isDefault: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label
          htmlFor="defaultAddress"
          className="ml-2 block text-sm text-gray-900"
        >
          Set as default address
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {initialData ? "Update Address" : "Add Address"}
        </button>
      </div>
    </form>
  );
} 