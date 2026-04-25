"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@tbms/ui/lib/utils";

interface InteractiveGridBackgroundProps
  extends React.HTMLProps<HTMLDivElement> {
  gridGap?: number;
  dotSize?: number;
  color?: string;
  highlightColor?: string;
  lightHighlightColor?: string;
  darkHighlightColor?: string;
  radius?: number;
}

function resolveCanvasColor(value: string, styles: CSSStyleDeclaration) {
  const cssVarMatch = value.match(/^var\((--[^)]+)\)$/);

  if (!cssVarMatch) {
    return value;
  }

  const [, tokenName] = cssVarMatch;
  const tokenValue = styles.getPropertyValue(tokenName).trim();

  if (!tokenValue) {
    return value;
  }

  return tokenValue;
}

export function InteractiveGridBackground({
  className,
  children,
  gridGap = 40,
  dotSize = 1.5,
  color = "var(--foreground)",
  highlightColor,
  lightHighlightColor = "var(--accent)",
  darkHighlightColor = "var(--primary)",
  radius = 300,
  ...props
}: InteractiveGridBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const computedStyles = getComputedStyle(container);
    const resolvedColor = resolveCanvasColor(color, computedStyles);
    const activeHighlightColor =
      highlightColor ??
      (resolvedTheme === "dark" ? darkHighlightColor : lightHighlightColor);
    const resolvedHighlightColor = resolveCanvasColor(
      activeHighlightColor,
      computedStyles
    );
    const baseAlpha = resolvedTheme === "dark" ? 0.32 : 0.16;
    const hoverAlpha = resolvedTheme === "dark" ? 0.98 : 0.82;

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw grid dots
      for (let x = 0; x < width; x += gridGap) {
        for (let y = 0; y < height; y += gridGap) {
          // Distance to mouse
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Base state
          let currentSize = dotSize;
          let currentAlpha = baseAlpha;
          let currentColor = resolvedColor;

          // Interaction
          if (dist < radius) {
            const ratio = 1 - dist / radius;
            currentSize = dotSize + ratio * 2.6;
            currentAlpha = baseAlpha + ratio * (hoverAlpha - baseAlpha);

            // We can't easily interpolate hex in canvas without parsing,
            // so we'll just switch color or rely on opacity.
            // For a premium feel, let's use the highlight color when very close
            if (ratio > 0.5) {
              currentColor = resolvedHighlightColor;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, currentSize, 0, Math.PI * 2);

          // Simple hex to rgba (approximate or just use globalAlpha)
          // Let's assume input colors are hex.
          // To support alpha, we set globalAlpha.
          ctx.fillStyle = currentColor;
          ctx.globalAlpha = currentAlpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gridGap, dotSize, color, highlightColor, radius, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-transparent",
        className
      )}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}
