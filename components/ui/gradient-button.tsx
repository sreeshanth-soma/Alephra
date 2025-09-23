"use client";

import type { HTMLAttributes } from "react";
import type { CSSProperties } from "react";

interface GradientButtonProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const GradientButton = ({
  children,
  width = "600px",
  height = "100px",
  className = "",
  onClick,
  disabled = false,
  ...props
}: GradientButtonProps) => {
  const commonGradientStyles = `
    relative rounded-[50px] cursor-pointer
    after:content-[""] after:block after:absolute after:bg-[var(--color-background)]
    after:inset-[5px] after:rounded-[45px] after:z-[1]
    after:transition-opacity after:duration-300 after:ease-linear
    flex items-center justify-center
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div className="text-[#eee] text-center select-none">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={`${commonGradientStyles} rotatingGradient ${className}`}
        style={
          {
            "--r": "0deg", // ✅ Type-safe now
            minWidth: width,
            height: height,
          } as CSSProperties
        }
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        {...props}
      >
        <span className="relative z-10 text-[var(--color-text)] flex items-center justify-center label tracking-wide">
          {children}
        </span>
      </div>
    </div>
  );
};

export default GradientButton;
