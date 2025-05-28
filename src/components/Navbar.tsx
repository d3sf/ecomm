"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const { data: session } = useSession();
  const { items } = useCart();
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">QuickShop</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {session ? (
              <UserDropdown />
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <User className="h-6 w-6" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 