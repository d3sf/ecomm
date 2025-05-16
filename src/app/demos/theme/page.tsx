"use client";

import { useState } from "react";
import Link from "next/link";

const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const getColorClass = (color: string, shade: number) => {
  const colorMap: Record<string, Record<number, string>> = {
    indigo: {
      50: "bg-indigo-50", 100: "bg-indigo-100", 200: "bg-indigo-200", 300: "bg-indigo-300",
      400: "bg-indigo-400", 500: "bg-indigo-500", 600: "bg-indigo-600", 700: "bg-indigo-700",
      800: "bg-indigo-800", 900: "bg-indigo-900"
    },
    emerald: {
      50: "bg-emerald-50", 100: "bg-emerald-100", 200: "bg-emerald-200", 300: "bg-emerald-300",
      400: "bg-emerald-400", 500: "bg-emerald-500", 600: "bg-emerald-600", 700: "bg-emerald-700",
      800: "bg-emerald-800", 900: "bg-emerald-900"
    },
    amber: {
      50: "bg-amber-50", 100: "bg-amber-100", 200: "bg-amber-200", 300: "bg-amber-300",
      400: "bg-amber-400", 500: "bg-amber-500", 600: "bg-amber-600", 700: "bg-amber-700",
      800: "bg-amber-800", 900: "bg-amber-900"
    },
    rose: {
      50: "bg-rose-50", 100: "bg-rose-100", 200: "bg-rose-200", 300: "bg-rose-300",
      400: "bg-rose-400", 500: "bg-rose-500", 600: "bg-rose-600", 700: "bg-rose-700",
      800: "bg-rose-800", 900: "bg-rose-900"
    },
    slate: {
      50: "bg-slate-50", 100: "bg-slate-100", 200: "bg-slate-200", 300: "bg-slate-300",
      400: "bg-slate-400", 500: "bg-slate-500", 600: "bg-slate-600", 700: "bg-slate-700",
      800: "bg-slate-800", 900: "bg-slate-900"
    }
  };
  return colorMap[color][shade];
};

const ColorSwatch = ({ color, shade }: { color: string; shade: number }) => (
  <div className="flex flex-col items-center">
    <div className={`w-20 h-20 rounded-lg ${getColorClass(color, shade)}`} />
    <span className="text-xs mt-2 text-slate-600">{color}-{shade}</span>
  </div>
);

export default function ThemeDemo() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`min-h-screen p-8 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link href="/demos" className="text-indigo-600 hover:text-indigo-800 mr-4">
              &larr; Back to Demos
            </Link>
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}>Theme Demo</h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
          >
            {isDark ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Primary Colors (Indigo) */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Primary Colors (Indigo)</h2>
          <div className="grid grid-cols-5 gap-4">
            {colorShades.map((shade) => (
              <ColorSwatch key={shade} color="indigo" shade={shade} />
            ))}
          </div>
        </div>

        {/* Secondary Colors (Emerald) */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Secondary Colors (Emerald)</h2>
          <div className="grid grid-cols-5 gap-4">
            {colorShades.map((shade) => (
              <ColorSwatch key={shade} color="emerald" shade={shade} />
            ))}
          </div>
        </div>

        {/* Warning Colors (Amber) */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Warning Colors (Amber)</h2>
          <div className="grid grid-cols-5 gap-4">
            {colorShades.map((shade) => (
              <ColorSwatch key={shade} color="amber" shade={shade} />
            ))}
          </div>
        </div>

        {/* Error Colors (Rose) */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Error Colors (Rose)</h2>
          <div className="grid grid-cols-5 gap-4">
            {colorShades.map((shade) => (
              <ColorSwatch key={shade} color="rose" shade={shade} />
            ))}
          </div>
        </div>

        {/* Neutral Colors (Slate) */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Neutral Colors (Slate)</h2>
          <div className="grid grid-cols-5 gap-4">
            {colorShades.map((shade) => (
              <ColorSwatch key={shade} color="slate" shade={shade} />
            ))}
          </div>
        </div>

        {/* Example Components */}
        <div className="space-y-6">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Example Components</h2>
          
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
            <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-white"} shadow-md`}>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>Card Title</h3>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>This is a sample card with our theme colors.</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-white"} shadow-md`}>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}>Another Card</h3>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Demonstrating dark mode support.</p>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? "bg-indigo-900/20" : "bg-indigo-50"} ${isDark ? "text-indigo-200" : "text-slate-900"}`}>
              This is an info alert using our primary color.
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-emerald-900/20" : "bg-emerald-50"} ${isDark ? "text-emerald-200" : "text-slate-900"}`}>
              This is a success alert using our secondary color.
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-amber-900/20" : "bg-amber-50"} ${isDark ? "text-amber-200" : "text-slate-900"}`}>
              This is a warning alert using our warning color.
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-rose-900/20" : "bg-rose-50"} ${isDark ? "text-rose-200" : "text-slate-900"}`}>
              This is an error alert using our error color.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 