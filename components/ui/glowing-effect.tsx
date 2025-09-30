"use client";

import * as React from "react";

interface GlowingEffectProps {
  glow?: boolean;
  blur?: number;
  spread?: number;
  borderWidth?: number;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
}

export function GlowingEffect({
  glow = true,
  blur = 8,
  spread = 64,
  borderWidth = 2,
  disabled = false,
  proximity = 80,
  inactiveZone = 0.05,
}: GlowingEffectProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (disabled) return;
    const overlay = ref.current;
    if (!overlay) return;
    const containerMaybe = overlay.parentElement as HTMLElement | null;
    if (!containerMaybe) return;
    const container: HTMLElement = containerMaybe;

    function update(ev: PointerEvent) {
      const rect = container.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      setIsInside(inside);
      if (!inside) return;
      setMousePosition({ x, y });
    }

    function onPointerMove(ev: PointerEvent) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => update(ev));
    }

    function onEnter() {
      setIsInside(true);
    }

    function onLeave() {
      setIsInside(false);
    }

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [disabled]);

  const style: React.CSSProperties = disabled
    ? {}
    : {
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        zIndex: 0,
        borderRadius: "inherit",
        background: glow
          ? `radial-gradient(${spread}px ${spread}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241,0.35), transparent ${Math.max(
              1,
              proximity
            )}px)`
          : undefined,
        boxShadow: glow
          ? `0 0 ${blur}px rgba(99,102,241,0.35), 0 0 ${blur * 2}px rgba(99,102,241,0.25)`
          : undefined,
        outline: borderWidth ? `${borderWidth}px solid rgba(156,163,175,0.15)` : undefined,
        mixBlendMode: "normal",
        opacity: disabled || !isInside ? 0 : 1 - inactiveZone,
        transition: "opacity 150ms ease"
      };

  return <div ref={ref} aria-hidden style={style} />;
}

export default GlowingEffect;


