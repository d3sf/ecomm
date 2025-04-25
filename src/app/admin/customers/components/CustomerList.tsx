"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import ActionIcons from "@/components/ui/ActionIcons";

interface Customer {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
}

interface CustomerListProps {
  customers: Customer[];
  onDelete: (id: number) => void;
  onEdit: (customer: Customer) => void;
  onSelectionChange: (selectedIds: number[]) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onDelete,
  onEdit,
  onSelectionChange
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(customers);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await onDelete(id);
        toast.success("Customer deleted successfully");
      } catch (error: unknown) {
        console.error("Error deleting customer:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete customer";
        toast.error(errorMessage);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ids = e.target.checked ? filteredCustomers.map(customer => customer.id) : [];
    setSelectedCustomers(ids);
    onSelectionChange(ids);
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => {
      const newSelection = prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId];
      
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const handleEditClick = (customer: Customer) => {
    onEdit(customer);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <table className="min-w-full text-left text-sm">
        <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-100">
          <tr className="bg-gray-50">
            <th className="px-4 py-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Phone</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Joining Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => handleSelectCustomer(customer.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-2">{customer.id}</td>
              <td className="px-4 py-2">{customer.name || "-"}</td>
              <td className="px-4 py-2">{customer.email}</td>
              <td className="px-4 py-2">{customer.phone || "-"}</td>
              <td className="px-4 py-2">
                {new Date(customer.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </td>
              <td className="px-4 py-2">
                <ActionIcons
                  onEdit={(e) => {
                    e.stopPropagation();
                    handleEditClick(customer);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDelete(customer.id);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList; 