import { MapPin, Edit, Trash } from "lucide-react";

interface Address {
  id?: number;
  addressLabel: "HOME" | "WORK" | "OTHER";
  customLabel?: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  readOnly?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  readOnly = false,
}: AddressCardProps) {
  const handleEdit = () => {
    if (address.id) onEdit(address.id);
  };

  const handleDelete = () => {
    if (address.id) onDelete(address.id);
  };

  const handleSetDefault = () => {
    if (address.id) onSetDefault(address.id);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {address.addressLabel === "OTHER" ? address.customLabel : address.addressLabel}
            </span>
            {address.isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Default
              </span>
            )}
          </div>
        </div>
        {!readOnly && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-gray-500"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-gray-900">{address.fullName}</p>
        <p className="text-sm text-gray-500">{address.phoneNumber}</p>
        <p className="text-sm text-gray-500">{address.addressLine1}</p>
        {address.addressLine2 && <p className="text-sm text-gray-500">{address.addressLine2}</p>}
        <p className="text-sm text-gray-500">
          {address.city}, {address.state} {address.postalCode}
        </p>
      </div>

      {!readOnly && !address.isDefault && (
        <div className="mt-4">
          <button
            onClick={handleSetDefault}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Set as Default
          </button>
        </div>
      )}
    </div>
  );
} 