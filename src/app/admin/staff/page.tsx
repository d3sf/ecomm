"use client";

// import React, { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { Plus, Trash2, Edit2, UserCog } from "lucide-react";
// import { toast } from "react-hot-toast";
// import SlidingPanel from "@/components/admin/SlidingPanel";
// import StaffForm from "./components/StaffForm";

// interface StaffMember {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   status: "active" | "inactive";
//   createdAt: string;
//   updatedAt: string;
// }

import { Users } from 'lucide-react';

// // Server Component
// async function StaffPageServer() {
//   const session = await getServerSession(adminAuthOptions);
//   if (!session?.user?.email) {
//     redirect('/admin/login');
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 mt-32">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white rounded-xl shadow-sm p-8 text-center">
//           <div className="flex flex-col items-center justify-center space-y-4">
//             <div className="p-4 bg-blue-50 rounded-full">
//               <Users className="w-12 h-12 text-blue-600" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
//             <p className="text-xl text-gray-600">Coming Soon</p>
//             <p className="text-gray-500 max-w-md">
//               We&apos;re working on bringing you a comprehensive staff management system. Stay tuned for updates!
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Client Component
// export default function StaffPage() {
//   return <StaffPageServer />;
// }

export default function StaffPage() {
  // const { data: session, status } = useSession();
  // const router = useRouter();
  // const [staff, setStaff] = useState<StaffMember[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [showForm, setShowForm] = useState(false);
  // const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  // const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/admin/login");
  //   }
  // }, [status, router]);

  // useEffect(() => {
  //   fetchStaff();
  // }, []);

  // const fetchStaff = async () => {
  //   try {
  //     const response = await fetch("/api/admin/staff");
  //     if (!response.ok) throw new Error("Failed to fetch staff");
  //     const data = await response.json();
  //     setStaff(data);
  //   } catch (error) {
  //     console.error("Error fetching staff:", error);
  //     toast.error("Failed to load staff members");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleDelete = async (id: number) => {
  //   if (!confirm("Are you sure you want to delete this staff member?")) return;

  //   try {
  //     const response = await fetch(`/api/admin/staff/${id}`, {
  //       method: "DELETE",
  //     });

  //     if (!response.ok) throw new Error("Failed to delete staff member");

  //     setStaff(staff.filter(member => member.id !== id));
  //     toast.success("Staff member deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting staff member:", error);
  //     toast.error("Failed to delete staff member");
  //   }
  // };

  // const handleBulkDelete = async () => {
  //   if (selectedStaffIds.length === 0) return;
  //   if (!confirm(`Are you sure you want to delete ${selectedStaffIds.length} staff members?`)) return;

  //   try {
  //     const response = await fetch("/api/admin/staff/bulk-delete", {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ ids: selectedStaffIds }),
  //     });

  //     if (!response.ok) throw new Error("Failed to delete staff members");

  //     setStaff(staff.filter(member => !selectedStaffIds.includes(member.id)));
  //     setSelectedStaffIds([]);
  //     toast.success("Staff members deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting staff members:", error);
  //     toast.error("Failed to delete staff members");
  //   }
  // };

  // const handleEdit = (staffMember: StaffMember) => {
  //   setSelectedStaff(staffMember);
  //   setShowForm(true);
  // };

  // const handleFormSubmit = async (formData: any) => {
  //   try {
  //     const url = selectedStaff 
  //       ? `/api/admin/staff/${selectedStaff.id}`
  //       : "/api/admin/staff";
      
  //     const response = await fetch(url, {
  //       method: selectedStaff ? "PUT" : "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) throw new Error("Failed to save staff member");

  //     await fetchStaff();
  //     setShowForm(false);
  //     setSelectedStaff(null);
  //     toast.success(
  //       selectedStaff 
  //         ? "Staff member updated successfully"
  //         : "Staff member added successfully"
  //     );
  //   } catch (error) {
  //     console.error("Error saving staff member:", error);
  //     toast.error("Failed to save staff member");
  //   }
  // };

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-xl text-gray-600">Coming Soon</p>
            <p className="text-gray-500 max-w-md">
              We&apos;re working on bringing you a comprehensive staff management system. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 