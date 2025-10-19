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
          {items.map((item, idx) => (
            <li
              className="relative w-[350px] max-w-full shrink-0 rounded-2xl px-8 py-6 md:w-[450px] overflow-hidden group hover:scale-[1.02] transition-transform duration-300
                         bg-gradient-to-br from-white via-gray-50 to-white
                         dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                         border-2 border-gray-200 dark:border-neutral-800
                         shadow-lg dark:shadow-2xl
                         hover:shadow-xl dark:hover:shadow-3xl"
              key={item.name}
              style={{ contain: "layout style paint" }}
            >
              <blockquote className="relative z-10">
                
                {/* Card content */}
                <span className="relative z-20 text-base leading-[1.7] font-medium text-gray-800 dark:text-gray-100 block">
                  {item.quote}
                </span>
                
                <div className="relative z-20 mt-6 flex flex-row items-center justify-between border-t-2 border-gray-300 dark:border-neutral-700 pt-4">
                  <span className="flex flex-col gap-1">
                    <span className="text-base leading-[1.6] font-bold text-blue-600 dark:text-blue-400">
                      {item.name}
                    </span>
                    <span className="text-sm leading-[1.6] font-semibold text-gray-600 dark:text-gray-300">
                      {item.title}
                    </span>
                  </span>
                  
                  {/* Step number badge */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-300
                                  bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-blue-500 dark:via-blue-600 dark:to-purple-600">
                    <span className="text-white font-bold text-lg">{idx + 1}</span>
                  </div>
                </div>
              </blockquote>
            </li>
          ))}
      </ul>
    </div>
  );
};

