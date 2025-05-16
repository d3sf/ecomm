"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import DashboardCards from "@/components/admin/DashboardCards";
import BestSellingProducts from "@/components/admin/BestSellingProducts";
import { AdminDashboardSkeleton } from "@/components/admin/skeletons";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with your store today
          </p>
        </div>

        {/* Order Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Statistics</h2>
          <DashboardCards />
        </div>

        {/* Best Selling Products Chart */}
        <div className="mb-8">
          <BestSellingProducts />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <p className="text-gray-500">
            This section will display recent activities and notifications.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Link href="/admin/orders" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              Manage Orders
            </Link>
            <Link href="/admin/products" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              Manage Products
            </Link>
            <Link href="/admin/customers" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              Manage Customers
            </Link>
            <Link href="/admin/categories" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              Manage Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
