import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Oops! Page Not Found</h2>

        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          Return to Home
        </Link>

        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
          <Link href="/contact" className="text-green-600 hover:text-green-700">
            Get Support
          </Link>
        </div>
      </div>
    </div>
  );
} 