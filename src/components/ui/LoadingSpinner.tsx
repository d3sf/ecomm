'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  fullPage?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  fullPage = false 
}: LoadingSpinnerProps) {
  // Define sizes
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };
  
  // Define colors
  const colorClasses = {
    primary: 'border-indigo-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  const spinnerClasses = `
    ${sizeClasses[size]} 
    ${colorClasses[color]} 
    animate-spin rounded-full
  `;

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className={spinnerClasses}></div>
      </div>
    );
  }

  return <div className={spinnerClasses}></div>;
} 