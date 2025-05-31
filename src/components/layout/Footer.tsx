'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { theme, withOpacity } from '@/lib/theme';

export default function Footer() {
  return (
    <footer 
      className="border-t"
      style={{ 
        backgroundColor: withOpacity(theme.primary, 0.02),
        borderColor: withOpacity(theme.primary, 0.1)
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              {/* <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                }}
              >
                M
              </div> */}
              <h3 className="text-xl font-bold">
                <span style={{ color: theme.primary }}>Meru</span>
                <span style={{ color: theme.dark }}>go</span>
              </h3>
            </div>
            <p style={{ color: theme.gray }}>
              Your one-stop shop for all your needs. Quality products, fast delivery, and excellent customer service.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a 
                href="#" 
                className="transition-colors hover:text-blue-600"
                style={{ color: theme.gray }}
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="transition-colors hover:text-blue-600"
                style={{ color: theme.gray }}
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="transition-colors hover:text-blue-600"
                style={{ color: theme.gray }}
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.dark }}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.dark }}>Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/legal/contact" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/shipping" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/returns" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.dark }}>Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/legal/privacy-policy" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/terms" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/shipping" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/returns" 
                  className="transition-colors hover:text-blue-600"
                  style={{ color: theme.gray }}
                >
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="mt-12 pt-8 border-t"
          style={{ borderColor: withOpacity(theme.primary, 0.1) }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p style={{ color: theme.gray }} className="text-sm text-center md:text-left">
              © {new Date().getFullYear()} Merugo. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/legal/privacy-policy" 
                className="text-sm transition-colors hover:text-blue-600"
                style={{ color: theme.gray }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/terms" 
                className="text-sm transition-colors hover:text-blue-600"
                style={{ color: theme.gray }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 