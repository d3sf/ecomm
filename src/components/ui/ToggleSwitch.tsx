"use client";

import React from "react";

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, label }) => {
  return (
    <div className="flex items-center gap-3">
      {label && <label className="text-sm">{label}</label>}
      <button
        type="button"
        onClick={() => onToggle(!isOn)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isOn ? "bg-green-600" : "bg-red-500"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            isOn ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
      {/* <span className="text-sm">{isOn ? "( )" : "( ) "}</span> */}
    </div>
  );
};

export default ToggleSwitch;
