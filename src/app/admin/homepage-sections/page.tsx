'use client';

import { useState } from 'react';
import HomepageSectionsManager from '../components/HomepageSectionsManager';
import CategoryGridManager from '../components/CategoryGridManager';
import { LayoutGrid, Grid } from 'lucide-react';

type Section = 'homepage' | 'category-grids' | null;

export default function HomepageSectionsPage() {
  const [activeSection, setActiveSection] = useState<Section>(null);

  const renderContent = () => {
    switch (activeSection) {
      case 'homepage':
        return <HomepageSectionsManager />;
      case 'category-grids':
        return <CategoryGridManager />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => setActiveSection('homepage')}
              className="p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 group hover:border-blue-100 hover:bg-blue-50/50"
            >
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-200">
                  <LayoutGrid className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Product Row Listing</h3>
                  <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-600">Manage product sections and their order</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('category-grids')}
              className="p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 group hover:border-green-100 hover:bg-green-50/50"
            >
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-200">
                  <Grid className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Category Grids</h3>
                  <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-600">Manage category grid images and order</p>
                </div>
              </div>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 mt-32 px-4 sm:px-6 lg:px-8">
      {activeSection && (
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection(null)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Sections
          </button>
          <h1 className="text-2xl font-bold">
            {activeSection === 'homepage' ? 'Homepage Sections' : 'Category Grids'}
          </h1>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
} 