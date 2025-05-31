import React from 'react';
import Link from 'next/link';
import { theme, withOpacity } from '@/lib/theme';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav 
        className="sticky top-0 z-50 border-b backdrop-blur-md bg-white/70"
        style={{ borderColor: withOpacity(theme.primary, 0.1) }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/"
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <span className="text-2xl font-bold">
                  <span style={{ color: theme.primary }}>Meru</span>
                  <span className="text-gray-900">go</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link 
                href="/legal/privacy-policy"
                className="text-sm font-medium hover:text-green-600 transition-colors"
                style={{ color: theme.gray }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/terms"
                className="text-sm font-medium hover:text-green-600 transition-colors"
                style={{ color: theme.gray }}
              >
                Terms
              </Link>
              <Link 
                href="/legal/returns"
                className="text-sm font-medium hover:text-green-600 transition-colors"
                style={{ color: theme.gray }}
              >
                Returns
              </Link>
              <Link 
                href="/legal/shipping"
                className="text-sm font-medium hover:text-green-600 transition-colors"
                style={{ color: theme.gray }}
              >
                Shipping
              </Link>
              <Link 
                href="/legal/contact"
                className="text-sm font-medium hover:text-green-600 transition-colors"
                style={{ color: theme.gray }}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 