'use client';

import React from 'react';
import Link from 'next/link';

export default function DemosPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Merugo Demo Pages</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Theme Demo Card */}
        <Link 
          href="/demos/theme"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Theme Demo</h2>
          <p className="text-gray-600 mb-4">
            Explore the color palette, design elements, and components used in Merugo.
            View primary, secondary, warning, error, and neutral colors with their various shades.
          </p>
          <div className="flex space-x-2">
            {['indigo', 'emerald', 'amber', 'rose', 'slate'].map(color => (
              <div 
                key={color} 
                className="w-8 h-8 rounded-full"
                style={{ 
                  backgroundColor: 
                    color === 'indigo' ? '#6366f1' : 
                    color === 'emerald' ? '#10b981' : 
                    color === 'amber' ? '#f59e0b' : 
                    color === 'rose' ? '#f43f5e' : 
                    '#64748b'
                }}
              />
            ))}
          </div>
        </Link>
        
        {/* Skeleton Loader Demo Card */}
        <Link 
          href="/demos/skeleton"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Skeleton Loader Demo</h2>
          <p className="text-gray-600 mb-4">
            View the various skeleton loading states used throughout the app for improved user experience.
            Includes product cards, carousels, category grids, and more.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 