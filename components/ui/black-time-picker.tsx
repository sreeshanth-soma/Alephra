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
  return (
    <div className={`relative group ${className || ""}`}>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-zinc-800 to-black" />
      <div className="relative rounded-xl border border-zinc-700/80 bg-black text-white focus-within:ring-2 focus-within:ring-zinc-400">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <Clock className="h-4 w-4" />
        </div>
        <input
          id={id}
          name={name}
          type="time"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="w-full appearance-none rounded-xl bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none placeholder-zinc-500 [color-scheme:dark]"
        />
      </div>
    </div>
  );
}

export default BlackTimePicker;


