"use client";

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

type BlackDatePickerProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function BlackDatePicker({ id, name, value, onChange, min, required, disabled, className }: BlackDatePickerProps) {
  const handleInputClick = () => {
    if (!disabled) {
      const input = document.getElementById(id || name || 'date-picker') as HTMLInputElement;
      if (input && input.showPicker) {
        input.showPicker();
      }
    }
  };

  return (
    <div className={`relative group ${className || ""}`}>
      <div className="relative rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus-within:ring-2 focus-within:ring-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-400 transition-colors">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <input
          id={id || name || 'date-picker'}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          onClick={handleInputClick}
          min={min}
          required={required}
          disabled={disabled}
          className="w-full appearance-none rounded-xl bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none placeholder-gray-500 dark:placeholder-gray-400 text-black dark:text-white cursor-pointer"
        />
      </div>
    </div>
  );
}

export default BlackDatePicker;


