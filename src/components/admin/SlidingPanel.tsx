'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  showUpdateButton?: boolean;
  onUpdate?: () => void;
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  showUpdateButton = false,
  onUpdate
}) => {
  // Handle body scroll locking using useEffect
  useEffect(() => {
    // Only add the class if running in the browser
    if (typeof window !== 'undefined') {
      // Lock scrolling when panel is open
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      
      // Cleanup
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Only render in the browser
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[60] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 id="panel-title" className="text-xl font-semibold">{title}</h2>
            <div className="flex items-center gap-4">
              {showUpdateButton && onUpdate && (
                <button
                  onClick={onUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
      
      {/* Style for the admin navbar when panel is open */}
      {isOpen && (
        <style jsx global>{`
          nav.fixed {
            filter: blur(1px);
            transition: filter 0.3s ease;
          }
        `}</style>
      )}
    </>,
    document.body
  );
};

export default SlidingPanel; 