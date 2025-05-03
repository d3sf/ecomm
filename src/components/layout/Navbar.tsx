"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import CartIcon from '@/components/cart/CartIcon';
import UserDropdown from '@/components/UserDropdown';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-[1440px] mx-auto px-4">
          <p className="text-sm text-center">Free Delivery on Orders Above ₹499</p>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex items-center">
            {/* <button className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
              <Menu size={24} />
            </button> */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">QuickShop</span>
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <SearchInput />
          </div>

          {/* Right - Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            <CartIcon />
            
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-t lg:hidden">
          <SearchInput />
        </div>
      )}
    </nav>
  );
}
