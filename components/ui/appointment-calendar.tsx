"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CalendarDay: React.FC<{ day: number | string; isHeader?: boolean }> = ({ day, isHeader }) => {
  const highlight = !isHeader && Math.random() < 0.15 ? "bg-indigo-500 text-white" : "text-gray-500";
  return (
    <div className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${isHeader ? "" : "rounded-xl"} ${highlight}`}>
      <span className={`font-medium ${isHeader ? "text-xs" : "text-sm"}`}>{day}</span>
    </div>
  );
};

export function AppointmentCalendar() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();

  const bookingLink = `https://cal.com/aliimam/designali`;

  const renderCalendarDays = () => {
    const startEmpties = Array.from({ length: firstDayOfWeek }, (_, i) => (
      <div key={`empty-start-${i}`} className="col-span-1 row-span-1 h-8 w-8" />
    ));
    const days = Array.from({ length: daysInMonth }, (_, i) => <CalendarDay key={`date-${i + 1}`} day={i + 1} />);
    return [
      ...dayNames.map((d) => <CalendarDay key={`header-${d}`} day={d} isHeader />),
      ...startEmpties,
      ...days,
    ];
  };

  return (
    <BentoCard height="h-auto" linkTo={bookingLink}>
      <div className="grid h-full gap-5">
        <div>
          <h2 className="mb-2 text-lg md:text-2xl font-semibold text-black dark:text-white">Book an appointment</h2>
          <p className="mb-2 text-xs md:text-sm text-gray-500">Use your preferred external calendar or add one below.</p>
          <Button className="mt-2 rounded-2xl">Book on Cal.com</Button>
        </div>
        <div>
          <div className="h-full w-full max-w-[550px] rounded-2xl border border-gray-200 dark:border-gray-800 p-2">
            <div className="h-full rounded-2xl border-2 border-white/10 dark:border-white/10 p-3">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-black dark:text-white"><span className="font-medium">{currentMonth}, {currentYear}</span></p>
                <span className="h-1 w-1 rounded-full" />
                <p className="text-xs text-gray-500">30 min slot</p>
              </div>
              <div className="mt-4 grid grid-cols-7 grid-rows-5 gap-2 px-2">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  height?: string;
  rowSpan?: number;
  colSpan?: number;
  className?: string;
  showHoverGradient?: boolean;
  hideOverflow?: boolean;
  linkTo?: string;
}

export function BentoCard({ children, height = "h-auto", rowSpan = 8, colSpan = 7, className = "", showHoverGradient = true, hideOverflow = true, linkTo, }: BentoCardProps) {
  const cardContent = (
    <div className={`group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-6 hover:bg-indigo-100/10 dark:hover:bg-indigo-900/10 ${hideOverflow && "overflow-hidden"} ${height} row-span-${rowSpan} col-span-${colSpan} ${className}`}>
      {linkTo && (
        <div className="absolute bottom-4 right-6 z-[5] flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-white opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-[-8px] group-hover:rotate-0 group-hover:opacity-100">
          <svg className="h-6 w-6 text-indigo-600" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.25 15.25V6.75H8.75" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7L6.75 17.25" />
          </svg>
        </div>
      )}
      {showHoverGradient && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tl from-indigo-400/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"></div>
      )}
      {children}
    </div>
  );

  if (linkTo) {
    return linkTo.startsWith("/") ? (
      <Link href={linkTo} className="block">{cardContent}</Link>
    ) : (
      <a href={linkTo} target="_blank" rel="noopener noreferrer" className="block">{cardContent}</a>
    );
  }
  return cardContent;
}


