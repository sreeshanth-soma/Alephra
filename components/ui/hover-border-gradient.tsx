/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverBorderGradient = ({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: { 
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  as?: React.ElementType;
  duration?: number;
  clockwise?: boolean;
  [key: string]: any;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const borderRef = React.useRef<HTMLDivElement>(null);
  const [r, setR] = React.useState(0);

  React.useEffect(() => {
    if (borderRef.current) {
      const rect = borderRef.current.getBoundingClientRect();
      setR(Math.max(rect.width, rect.height) / 2);
    }
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!borderRef.current) return;
    const rect = borderRef.current.getBoundingClientRect();
    setR(Math.max(rect.width, rect.height) / 2);
    borderRef.current.style.setProperty(
      "--x",
      (event.clientX - rect.left).toFixed(2)
    );
    borderRef.current.style.setProperty(
      "--y",
      (event.clientY - rect.top).toFixed(2)
    );
  };

  const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#FBBF24"];

  return (
    <Tag
      className={cn(
        "relative flex items-center justify-center p-1 overflow-hidden",
        containerClassName
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 z-0 opacity-0 transition duration-500",
          hovered && "opacity-100"
        )}
        style={{
          background: `radial-gradient(
            var(--r)px var(--r)px at var(--x)px var(--y)px,
            ${colors[0]} 0%,
            ${colors[1]} 20%,
            ${colors[2]} 40%,
            ${colors[3]} 60%,
            transparent 100%
          )`,
          maskImage: `radial-gradient(circle at var(--x)px var(--y)px, white, transparent ${r}px)`,
          WebkitMaskImage: `radial-gradient(circle at var(--x)px var(--y)px, white, transparent ${r}px)`,
          pointerEvents: "none",
        }}
      ></div>
      <motion.div
        className={cn(
          "relative z-10 flex items-center justify-center bg-white dark:bg-black rounded-[inherit]",
          className
        )}
        style={{
          transition: "all 0.3s ease-out",
        }}
      >
        {children}
      </motion.div>
    </Tag>
  );
};
