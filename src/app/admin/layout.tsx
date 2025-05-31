"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { 
    LayoutDashboard, 
    Package, 
    FolderTree, 
    LayoutGrid, 
    ShoppingCart, 
    Users,
    LogOut,
    UserCog
} from "lucide-react";
import { useEffect, Suspense } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './globals.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
});

//  [todo] add Icons
const sidebarLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: FolderTree },
    { name: "Homepage", path: "/admin/homepage-sections", icon: LayoutGrid },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Staff", path: "/admin/staff", icon: UserCog },
];

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const isLoginPage = pathname === "/admin/login";
    
    useEffect(() => {
        NProgress.start();
        
        // Simulate a minimum loading time for better UX
        const timer = setTimeout(() => {
            NProgress.done();
        }, 300);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [pathname, searchParams]);
    
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
    
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/admin/login" });
    };
    
    return (
        <div className="min-h-screen bg-slate-50">
            <AdminNavbar />
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col h-screen fixed top-0">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
                            <nav>
                                <ul>
                                    {sidebarLinks.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <li key={link.path} className="mb-2">
                                                <Link href={link.path}>
                                                    <span className={`flex items-center px-4 py-2 rounded ${
                                                        pathname === link.path 
                                                            ? "bg-slate-800" 
                                                            : "hover:bg-slate-800"
                                                    }`}>
                                                        <Icon className="w-5 h-5 mr-3" />
                                                        {link.name}
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                        <div className="mt-auto">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center text-xl bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 p-8 pt-16">
                    {children}
                </main> 
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        }>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}

