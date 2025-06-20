"use client";

import { useState, useEffect, useRef } from 'react';
import SearchInput from '@/components/SearchInput';
import CartIcon from '@/components/cart/CartIcon';
import UserDropdown from '@/components/UserDropdown';
import { theme, withOpacity } from '@/lib/theme';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const prevScrollPos = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  
  const isCheckoutPage = pathname === '/checkout';
  
  // Minimum scroll amount needed to trigger hide/show
  const SCROLL_THRESHOLD = 50;
  // How far user must scroll down before hiding banner
  const HIDE_THRESHOLD = 100;

  // Handle navigation to home page
  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        const currentScrollPos = window.scrollY;
        const scrollDifference = Math.abs(currentScrollPos - prevScrollPos.current);
        
        if (scrollDifference > SCROLL_THRESHOLD) {
          if (currentScrollPos > HIDE_THRESHOLD && currentScrollPos > prevScrollPos.current) {
            setIsTopBarVisible(false);
          } else if (currentScrollPos < prevScrollPos.current || currentScrollPos < HIDE_THRESHOLD) {
            setIsTopBarVisible(true);
          }
          
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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-100/50">
      {/* Top Bar */}
      <div 
        className="overflow-hidden transition-all duration-300" 
        style={{ 
          maxHeight: isTopBarVisible ? '40px' : '0',
          opacity: isTopBarVisible ? 1 : 0,
          background: `linear-gradient(90deg, ${withOpacity(theme.primary, 0.25)} 0%, ${withOpacity(theme.secondary, 0.25)} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'gradient-x 1s linear infinite',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${withOpacity(theme.primary, 0.15)}`
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 py-2">
          <p className="text-sm text-center font-medium" style={{ color: theme.primary }}>
            Free Delivery on Orders Above ₹199
          </p>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex items-center">
            <button 
              onClick={navigateToHome} 
              className="flex items-center cursor-pointer transition-transform hover:scale-105"
            >
              <span className="text-2xl font-bold" style={{ color: theme.dark }}>
                <span style={{ color: theme.primary }}>Meru</span>
                <span>go</span>
              </span>
            </button>
          </div>

          {/* Center - Search Bar */}
          {!isCheckoutPage && (
            <div className="flex-1 mx-2 md:mx-8 w-[400px]">
              <div className="w-full">
                <SearchInput />
              </div>
            </div>
          )}

          {/* Right - Icons */}
          {!isCheckoutPage && (
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative">
                <CartIcon />
                {/* Cart Indicator */}
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs text-white"
                  style={{ 
                    backgroundColor: theme.primary,
                    display: 'none' // TODO: Show based on cart items
                  }}
                >
                  0
                </div>
              </div>
              
              <div className="relative group">
                <UserDropdown />
                {/* Hover Indicator */}
                <div  
                  className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                  style={{ backgroundColor: theme.primary }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Add this at the end of the file
const styles = `
@keyframes gradient-x {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: 0% 0;
  }
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
