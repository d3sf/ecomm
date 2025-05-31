"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { User, Package, MapPin, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme, withOpacity } from "@/lib/theme";

export default function UserDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center py-1 px-2 rounded-full transition-colors duration-200"
        aria-expanded={isOpen}
        aria-label="User menu"
      > 
        <div 
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
            session ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <User 
            size={18} 
            style={{ 
              color: session ? theme.primary : theme.gray 
            }} 
          />
        </div>
      </button>

      <div 
        className={`absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-200 ease-in-out transform ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }`}
        style={{ 
          border: `1px solid ${withOpacity(theme.primary, 0.1)}`,
          boxShadow: `0 4px 6px -1px ${withOpacity(theme.primary, 0.1)}, 0 2px 4px -1px ${withOpacity(theme.primary, 0.06)}`
        }}
      >
        {session ? (
          <>
            <div className="py-1">
              {session.user?.type === "user" || !session.user?.type ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-green-50"
                    style={{ color: theme.dark }}
                    onClick={() => setIsOpen(false)}
                  >
                    <UserCircle className="w-4 h-4 mr-3" style={{ color: theme.primary }} />
                    Account
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-green-50"
                    style={{ color: theme.dark }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="w-4 h-4 mr-3" style={{ color: theme.primary }} />
                    My Orders
                  </Link>
                  <Link
                    href="/account?tab=addresses"
                    className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-green-50"
                    style={{ color: theme.dark }}
                    onClick={() => setIsOpen(false)}
                  >
                    <MapPin className="w-4 h-4 mr-3" style={{ color: theme.primary }} />
                    Saved Addresses
                  </Link>
                </>
              ) : (
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-green-50"
                  style={{ color: theme.dark }}
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircle className="w-4 h-4 mr-3" style={{ color: theme.primary }} />
                  Admin Dashboard
                </Link>
              )}
            </div>
            
            <div 
              className="py-1 border-t"
              style={{ borderColor: withOpacity(theme.primary, 0.1) }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm transition-colors hover:bg-red-50"
                style={{ color: theme.error }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-green-50"
            style={{ color: theme.dark }}
            onClick={() => setIsOpen(false)}
          >
            <UserCircle className="w-4 h-4 mr-3" style={{ color: theme.primary }} />
            Login
          </Link>
        )}
      </div>
    </div>
  );
} 
