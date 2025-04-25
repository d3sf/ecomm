"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

//  [todo] add Icons
const sidebarLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Homepage Sections", path: "/admin/homepage-sections" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Customers", path: "/admin/customers" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isLoginPage = pathname === "/admin/login";
    
    // If we're on the login page, just render the children
    if (isLoginPage) {
        return <>{children}</>;
    }

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="mb-4">Please log in to access the admin panel.</p>
                    <Link href="/admin/login" className="text-blue-500 hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col h-screen fixed">
                <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
                <nav className="flex-1">
                    <ul>
                        {sidebarLinks.map((link) => (
                            <li key={link.path} className="mb-2">
                                <Link href={link.path}>
                                    <span className={`block px-4 py-2 rounded ${pathname === link.path ? "bg-gray-700" : "hover:bg-gray-800"}`}>
                                        {link.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <button className="w-full text-xl bg-green-500 hover:bg-green-600 text-white py-2 rounded">
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

