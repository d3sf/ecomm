"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function AdminNavbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/admin/login" });
    };

    return (
        <nav className="bg-white border-b border-gray-200 fixed w-[calc(100%-16rem)] z-20 left-64">
            <div className="px-4 py-3 flex justify-end items-center h-16">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 px-3 py-2 rounded-lg"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                            {session?.user?.name || session?.user?.email}
                        </span>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                            <Link
                                href="/admin"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

