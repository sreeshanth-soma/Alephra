"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  icon,
  className
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn("relative z-50", className)} ref={dropdownRef}>
      {label && (
        <label className="text-[11px] uppercase tracking-wide font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
          {icon}
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-4 flex items-center justify-between gap-2",
          "rounded-lg border-2 transition-all duration-200",
          "bg-white dark:bg-zinc-900",
          "hover:border-blue-400 dark:hover:border-blue-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "shadow-sm hover:shadow-md",
          isOpen 
            ? "border-blue-500 dark:border-blue-400 shadow-md" 
            : "border-gray-300 dark:border-gray-600"
        )}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {selectedOption?.icon && (
            <span className="text-lg">
              {typeof selectedOption.icon === 'string' ? selectedOption.icon : selectedOption.icon}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center justify-between gap-2",
                    "transition-colors duration-150",
                    "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    option.value === value 
                      ? "bg-blue-100 dark:bg-blue-900/30" 
                      : "bg-white dark:bg-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 text-left">
                    {option.icon && (
                      <span className="text-lg">
                        {typeof option.icon === 'string' ? option.icon : option.icon}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-medium",
                        option.value === value 
                          ? "text-blue-700 dark:text-blue-300" 
                          : "text-gray-900 dark:text-gray-100"
                      )}>
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

