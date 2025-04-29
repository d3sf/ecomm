"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, UserCog } from "lucide-react";
import { toast } from "react-hot-toast";
import SlidingPanel from "@/components/admin/SlidingPanel";
import StaffForm from "./components/StaffForm";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function StaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete staff member");

      setStaff(staff.filter(member => member.id !== id));
      toast.success("Staff member deleted successfully");
    } catch (error) {
      console.error("Error deleting staff member:", error);
      toast.error("Failed to delete staff member");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStaffIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedStaffIds.length} staff members?`)) return;

    try {
      const response = await fetch("/api/admin/staff/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedStaffIds }),
      });

      if (!response.ok) throw new Error("Failed to delete staff members");

      setStaff(staff.filter(member => !selectedStaffIds.includes(member.id)));
      setSelectedStaffIds([]);
      toast.success("Staff members deleted successfully");
    } catch (error) {
      console.error("Error deleting staff members:", error);
      toast.error("Failed to delete staff members");
    }
  };

  const handleEdit = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = selectedStaff 
        ? `/api/admin/staff/${selectedStaff.id}`
        : "/api/admin/staff";
      
      const response = await fetch(url, {
        method: selectedStaff ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save staff member");

      await fetchStaff();
      setShowForm(false);
      setSelectedStaff(null);
      toast.success(
        selectedStaff 
          ? "Staff member updated successfully"
          : "Staff member added successfully"
      );
    } catch (error) {
      console.error("Error saving staff member:", error);
      toast.error("Failed to save staff member");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setSelectedStaff(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus size={20} />
            Add Staff
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedStaffIds.length === 0}
          >
            <Trash2 size={20} />
            Delete Selected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStaffIds(staff.map(member => member.id));
                    } else {
                      setSelectedStaffIds([]);
                    }
                  }}
                  checked={selectedStaffIds.length === staff.length && staff.length > 0}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedStaffIds.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStaffIds([...selectedStaffIds, member.id]);
                      } else {
                        setSelectedStaffIds(selectedStaffIds.filter(id => id !== member.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCog className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidingPanel
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedStaff(null);
        }}
        title={selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
      >
        <StaffForm
          staff={selectedStaff}
          onSubmit={handleFormSubmit}
        />
      </SlidingPanel>
    </div>
  );
} 