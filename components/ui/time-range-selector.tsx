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
  { value: "7d", label: "7 DAYS", days: 7 },
  { value: "30d", label: "30 DAYS", days: 30 },
  { value: "3m", label: "3 MONTHS", days: 90 },
  { value: "6m", label: "6 MONTHS", days: 180 },
  { value: "1y", label: "1 YEAR", days: 365 },
  { value: "all", label: "ALL TIME", days: Infinity },
];

export function TimeRangeSelector({ selected, onChange, className = "" }: TimeRangeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="flex items-center gap-2 text-sm font-bold font-mono text-black dark:text-white uppercase">
        <Clock className="w-4 h-4" strokeWidth={2.5} />
        <span>TIME RANGE:</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold font-mono border-2 transition-all uppercase
              ${
                selected === option.value
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  : "bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
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
