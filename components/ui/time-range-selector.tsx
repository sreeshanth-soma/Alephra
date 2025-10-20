"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";

export type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
}

const timeRangeOptions: { value: TimeRange; label: string; days: number }[] = [
  { value: "7d", label: "7 Days", days: 7 },
  { value: "30d", label: "30 Days", days: 30 },
  { value: "3m", label: "3 Months", days: 90 },
  { value: "6m", label: "6 Months", days: 180 },
  { value: "1y", label: "1 Year", days: 365 },
  { value: "all", label: "All Time", days: Infinity },
];

export function TimeRangeSelector({ selected, onChange, className = "" }: TimeRangeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Time Range:</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                selected === option.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function getDaysFromRange(range: TimeRange): number {
  const option = timeRangeOptions.find(o => o.value === range);
  return option?.days || 30;
}

export function filterDataByRange<T extends { date: string | Date }>(
  data: T[],
  range: TimeRange
): T[] {
  if (range === "all" || data.length === 0) return data;
  
  const days = getDaysFromRange(range);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return data.filter(item => {
    const itemDate = typeof item.date === 'string' ? new Date(item.date) : item.date;
    return itemDate >= cutoffDate;
  });
}
