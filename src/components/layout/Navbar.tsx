"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import CartIcon from '@/components/cart/CartIcon';
import UserDropdown from '@/components/UserDropdown';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const prevScrollPos = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Minimum scroll amount needed to trigger hide/show
  const SCROLL_THRESHOLD = 50;
  // How far user must scroll down before hiding banner
  const HIDE_THRESHOLD = 100;

  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Only process scroll after a short delay (debounce)
      scrollTimeout.current = setTimeout(() => {
        const currentScrollPos = window.scrollY;
        const scrollDifference = Math.abs(currentScrollPos - prevScrollPos.current);
        
        // Only trigger if scrolled more than the minimum threshold
        if (scrollDifference > SCROLL_THRESHOLD) {
          if (currentScrollPos > HIDE_THRESHOLD && currentScrollPos > prevScrollPos.current) {
            // Scrolling DOWN past the threshold
            setIsTopBarVisible(false);
          } else if (currentScrollPos < prevScrollPos.current || currentScrollPos < HIDE_THRESHOLD) {
            // Scrolling UP or at the top of the page
            setIsTopBarVisible(true);
          }
          
          // Update previous scroll position
          prevScrollPos.current = currentScrollPos;
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 shadow-sm border-b border-gray-100">
      {/* Top Bar with animation */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white overflow-hidden transition-all duration-300" 
        style={{ 
          maxHeight: isTopBarVisible ? '40px' : '0',
          opacity: isTopBarVisible ? 1 : 0
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 py-2">
          <p className="text-sm text-center">Free Delivery on Orders Above ₹199</p>
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
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                QuickShop
              </span>
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
              className="p-2 hover:bg-gray-50 rounded-full lg:hidden transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            
            <CartIcon />
            
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-t lg:hidden bg-white/50 backdrop-blur-sm">
          <SearchInput />
        </div>
      )}
    </nav>
  );
}
