"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import CustomerList from "./components/CustomerList";
import Button from "@/components/ui/Button";
import { TableSkeleton } from "@/components/admin/skeletons";

interface Customer {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(customers.filter((customer) => customer.id !== id));
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleEdit = (customer: Customer) => {
    router.push(`/admin/customers/${customer.id}`);
  };

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedCustomers(selectedIds);
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select customers to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customers?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/customers/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedCustomers }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customers");
      }

      setCustomers(customers.filter((customer) => !selectedCustomers.includes(customer.id)));
      setSelectedCustomers([]);
      toast.success("Customers deleted successfully");
    } catch (error) {
      console.error("Error deleting customers:", error);
      toast.error("Failed to delete customers");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex gap-2">
          {selectedCustomers.length > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              Delete Selected
            </Button>
          )}
          <Button
            onClick={() => router.push("/admin/customers/new")}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Customer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : (
        <CustomerList
          customers={customers}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onSelectionChange={handleSelectionChange}
        />
      )}
    </div>
  );
} 