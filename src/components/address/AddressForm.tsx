"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface AddressFormProps {
  onCancel: () => void;
  onSubmit: (address: AddressFormData) => Promise<void>;
  initialData?: Partial<AddressFormData>;
}

interface AddressFormData {
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

const AddressForm: React.FC<AddressFormProps> = ({ onCancel, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: initialData?.fullName || "",
    phoneNumber: initialData?.phoneNumber || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postalCode: initialData?.postalCode || "",
    isDefault: initialData?.isDefault || false,
    addressLabel: initialData?.addressLabel || "HOME",
    customLabel: initialData?.customLabel || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Full Name</label>
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Phone Number</label>
        <input
          type="tel"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Address Line 1</label>
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Address Line 2</label>
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">City</label>
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">State</label>
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Postal Code</label>
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Address Label</label>
        <select
          className="flex-1 p-2 border border-gray-300 rounded"
          value={formData.addressLabel}
          onChange={(e) =>
            setFormData({
              ...formData,
              addressLabel: e.target.value as "HOME" | "WORK" | "OTHER",
            })
          }
        >
          <option value="HOME">Home</option>
          <option value="WORK">Work</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {formData.addressLabel === "OTHER" && (
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Custom Label</label>
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={formData.customLabel}
            onChange={(e) =>
              setFormData({
                ...formData,
                customLabel: e.target.value,
              })
            }
            required
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="w-40 font-medium">Default Address</label>
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData({
              ...formData,
              isDefault: e.target.checked,
            })
          }
        />
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save Address
        </button>
      </div>
    </form>
  );
};

export default AddressForm; 