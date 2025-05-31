"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  onPageChange: (page: number) => void;
  customersPerPage: number;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onDelete,
  onEdit,
  onSelectionChange,
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  totalCustomers,
  onPageChange,
  customersPerPage
}) => {
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

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
    const ids = e.target.checked ? customers.map(customer => customer.id) : [];
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

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * customersPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * customersPerPage, totalCustomers)}
            </span>{' '}
            of <span className="font-medium">{totalCustomers}</span> results
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  currentPage === i + 1
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                } border`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

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
              onChange={(e) => onSearchChange(e.target.value)}
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
                checked={selectedCustomers.length === customers.length && customers.length > 0}
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
          {customers.map((customer) => (
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
      <PaginationControls />
    </div>
  );
};

export default CustomerList; 