"use client";

import React from "react";
import { Clock } from "lucide-react";

type BlackTimePickerProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function BlackTimePicker({ id, name, value, onChange, required, disabled, className }: BlackTimePickerProps) {
  const handleInputClick = () => {
    if (!disabled) {
      const input = document.getElementById(id || name || 'time-picker') as HTMLInputElement;
      if (input && input.showPicker) {
        input.showPicker();
      }
    }
  };

  return (
    <div className={`relative group ${className || ""}`}>
      <div className="relative rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus-within:ring-2 focus-within:ring-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-400 transition-colors">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
          <Clock className="h-4 w-4" />
        </div>
        <input
          id={id || name || 'time-picker'}
          name={name}
          type="time"
          value={value}
          onChange={onChange}
          onClick={handleInputClick}
          required={required}
          disabled={disabled}
          className="w-full appearance-none rounded-xl bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none placeholder-gray-500 dark:placeholder-gray-400 text-black dark:text-white cursor-pointer"
        />
      </div>
    </div>
  );
}

export default BlackTimePicker;


