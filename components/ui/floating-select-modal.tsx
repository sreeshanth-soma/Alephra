"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SelectOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
  description?: string;
}

interface FloatingSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  className?: string;
}

export function FloatingSelectModal({
  isOpen,
  onClose,
  title,
  options,
  value,
  onChange,
  searchable = true,
  className
}: FloatingSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    onClose();
    setSearchTerm('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed' }}
          >
            <motion.div
              ref={modalRef}
              className={cn(
                "relative w-full max-w-md bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl pointer-events-auto",
                className
              )}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-black dark:text-white">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Search Input */}
              {searchable && options.length > 5 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search options..."
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "w-full px-6 py-4 flex items-center justify-between gap-3 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0",
                        option.value === value 
                          ? "bg-gray-100 dark:bg-gray-800" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-900"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        {option.icon && (
                          <div className="flex-shrink-0">
                            {typeof option.icon === 'string' ? (
                              <span className="text-2xl">{option.icon}</span>
                            ) : (
                              <div className="w-6 h-6 flex items-center justify-center">
                                {option.icon}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col flex-1">
                          <span className={cn(
                            "text-sm font-semibold",
                            option.value === value 
                              ? "text-black dark:text-white" 
                              : "text-gray-700 dark:text-gray-300"
                          )}>
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {option.value === value && (
                        <Check className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
                      )}
                    </motion.button>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No options found
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {filteredOptions.length} of {options.length} options
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
