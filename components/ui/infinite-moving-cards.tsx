"use client";
 
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
 
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    
    const scrollerContent = Array.from(scrollerRef.current.children);

    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      if (scrollerRef.current) {
        scrollerRef.current.appendChild(duplicatedItem);
      }
    });

    // Set direction
    if (direction === "left") {
      containerRef.current.style.setProperty(
        "--animation-direction",
        "forwards",
      );
    } else {
      containerRef.current.style.setProperty(
        "--animation-direction",
        "reverse",
      );
    }

    // Set speed
    if (speed === "fast") {
      containerRef.current.style.setProperty("--animation-duration", "20s");
    } else if (speed === "normal") {
      containerRef.current.style.setProperty("--animation-duration", "40s");
    } else {
      containerRef.current.style.setProperty("--animation-duration", "80s");
    }

    setStart(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
      style={{ contain: "layout style paint" }}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{ willChange: start ? "transform" : "auto" }}
      >
          {items.map((item, idx) => {
            // Define vibrant gradient patterns for each step
            const gradients = [
              "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 dark:from-blue-600/30 dark:via-indigo-600/30 dark:to-purple-600/30",
              "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 dark:from-purple-600/30 dark:via-pink-600/30 dark:to-rose-600/30",
              "bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 dark:from-emerald-600/30 dark:via-teal-600/30 dark:to-cyan-600/30",
              "bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 dark:from-amber-600/30 dark:via-orange-600/30 dark:to-red-600/30",
              "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 dark:from-violet-600/30 dark:via-fuchsia-600/30 dark:to-pink-600/30",
              "bg-gradient-to-br from-lime-500/20 via-green-500/20 to-emerald-500/20 dark:from-lime-600/30 dark:via-green-600/30 dark:to-emerald-600/30",
            ];
            
            const borderColors = [
              "border-blue-300/50 dark:border-blue-500/50",
              "border-purple-300/50 dark:border-purple-500/50",
              "border-emerald-300/50 dark:border-emerald-500/50",
              "border-amber-300/50 dark:border-amber-500/50",
              "border-violet-300/50 dark:border-violet-500/50",
              "border-lime-300/50 dark:border-lime-500/50",
            ];
            
            const badgeGradients = [
              "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/50",
              "bg-gradient-to-br from-purple-600 to-pink-700 shadow-purple-500/50",
              "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/50",
              "bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-500/50",
              "bg-gradient-to-br from-violet-600 to-fuchsia-700 shadow-violet-500/50",
              "bg-gradient-to-br from-lime-600 to-green-700 shadow-lime-500/50",
            ];
            
            const textAccents = [
              "text-blue-700 dark:text-blue-400",
              "text-purple-700 dark:text-purple-400",
              "text-emerald-700 dark:text-emerald-400",
              "text-amber-700 dark:text-amber-400",
              "text-violet-700 dark:text-violet-400",
              "text-lime-700 dark:text-lime-400",
            ];
            
            const gradient = gradients[idx % gradients.length];
            const borderColor = borderColors[idx % borderColors.length];
            const badgeGradient = badgeGradients[idx % badgeGradients.length];
            const textAccent = textAccents[idx % textAccents.length];
            
            return (
              <li
                className={`relative w-[350px] max-w-full shrink-0 rounded-2xl px-8 py-7 md:w-[450px] overflow-hidden group hover:scale-105 transition-all duration-300
                           ${gradient}
                           border-2 ${borderColor}
                           shadow-xl hover:shadow-2xl
                           backdrop-blur-sm`}
                key={item.name}
                style={{ contain: "layout style paint" }}
              >
                {/* Animated glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 blur-xl"></div>
                
                <blockquote className="relative z-10">
                  {/* Card content */}
                  <span className="relative z-20 text-base leading-[1.7] font-semibold text-gray-900 dark:text-white block">
                    {item.quote}
                  </span>
                  
                  <div className="relative z-20 mt-6 flex flex-row items-center justify-between border-t-2 border-white/30 dark:border-white/20 pt-4">
                    <span className="flex flex-col gap-1">
                      <span className={`text-base leading-[1.6] font-bold ${textAccent}`}>
                        {item.name}
                      </span>
                      <span className="text-sm leading-[1.6] font-semibold text-gray-700 dark:text-gray-200">
                        {item.title}
                      </span>
                    </span>
                    
                    {/* Step number badge with vibrant gradient */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${badgeGradient}`}>
                      <span className="text-white font-bold text-xl">{idx + 1}</span>
                    </div>
                  </div>
                </blockquote>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

