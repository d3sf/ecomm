"use client";

import { useState } from "react";

export default function ThemeDemo() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen p-8 ${isDark ? "dark bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Theme Demo</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700"
          >
            {isDark ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Primary Colors (Indigo) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Primary Colors (Indigo)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-lg bg-indigo-${shade}`} />
                <span className="text-xs mt-2 text-slate-600 dark:text-slate-400">indigo-{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Colors (Emerald) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Secondary Colors (Emerald)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-lg bg-emerald-${shade}`} />
                <span className="text-xs mt-2 text-slate-600 dark:text-slate-400">emerald-{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Colors (Amber) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Warning Colors (Amber)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-lg bg-amber-${shade}`} />
                <span className="text-xs mt-2 text-slate-600 dark:text-slate-400">amber-{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Colors (Rose) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Error Colors (Rose)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-lg bg-rose-${shade}`} />
                <span className="text-xs mt-2 text-slate-600 dark:text-slate-400">rose-{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Neutral Colors (Slate) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Neutral Colors (Slate)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-lg bg-slate-${shade}`} />
                <span className="text-xs mt-2 text-slate-600 dark:text-slate-400">slate-{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Example Components */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Example Components</h2>
          
          {/* Buttons */}
          <div className="space-x-4">
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Secondary Button
            </button>
            <button className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600">
              Warning Button
            </button>
            <button className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600">
              Error Button
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Card Title</h3>
              <p className="text-slate-600 dark:text-slate-400">This is a sample card with our theme colors.</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Another Card</h3>
              <p className="text-slate-600 dark:text-slate-400">Demonstrating dark mode support.</p>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200">
              This is an info alert using our primary color.
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200">
              This is a success alert using our secondary color.
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
              This is a warning alert using our warning color.
            </div>
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200">
              This is an error alert using our error color.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 