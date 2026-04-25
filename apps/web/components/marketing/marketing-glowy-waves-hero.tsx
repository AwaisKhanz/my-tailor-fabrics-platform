"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { LazyMotion, domAnimation, m, type Variants } from "motion/react";

import { cn } from "@tbms/ui/lib/utils";

import type { MarketingStat } from "@/lib/marketing-content";

type Point = {
  x: number;
  y: number;
};

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
  },
};

export function MarketingGlowyWavesHero({
  eyebrow,
  title,
  description,
  pills,
  stats,
  primaryCta,
  secondaryCta,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  pills: readonly string[];
  stats: readonly MarketingStat[];
  primaryCta: React.ReactNode;
  secondaryCta: React.ReactNode;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let animationId = 0;
    let time = 0;

    const computeThemeColors = () => {
      const rootStyles = getComputedStyle(document.documentElement);

      const resolveColor = (variables: string[], alpha = 1) => {
        const tempElement = document.createElement("div");
        tempElement.style.position = "absolute";
        tempElement.style.visibility = "hidden";
        tempElement.style.width = "1px";
        tempElement.style.height = "1px";
        document.body.appendChild(tempElement);

        let color = `rgba(255, 255, 255, ${alpha})`;

        for (const variable of variables) {
          const value = rootStyles.getPropertyValue(variable).trim();
          if (!value) continue;

          tempElement.style.backgroundColor = `var(${variable})`;
          const computedColor = getComputedStyle(tempElement).backgroundColor;

          if (!computedColor || computedColor === "rgba(0, 0, 0, 0)") {
            continue;
          }

          if (alpha < 1) {
            const rgbMatch = computedColor.match(
              /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/,
            );
            if (rgbMatch) {
              color = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
            } else {
              color = computedColor;
            }
          } else {
            color = computedColor;
          }
          break;
        }

        document.body.removeChild(tempElement);
        return color;
      };

      return {
        backgroundTop: resolveColor(["--background"], 1),
        backgroundBottom: resolveColor(["--muted", "--background"], 0.96),
        wavePalette: [
          {
            offset: 0,
            amplitude: 70,
            frequency: 0.003,
            color: resolveColor(["--primary"], 0.8),
            opacity: 0.45,
          },
          {
            offset: Math.PI / 2,
            amplitude: 90,
            frequency: 0.0026,
            color: resolveColor(["--accent", "--primary"], 0.7),
            opacity: 0.35,
          },
          {
            offset: Math.PI,
            amplitude: 60,
            frequency: 0.0034,
            color: resolveColor(["--secondary", "--foreground"], 0.65),
            opacity: 0.3,
          },
          {
            offset: Math.PI * 1.5,
            amplitude: 80,
            frequency: 0.0022,
            color: resolveColor(["--primary-foreground", "--foreground"], 0.25),
            opacity: 0.25,
          },
          {
            offset: Math.PI * 2,
            amplitude: 55,
            frequency: 0.004,
            color: resolveColor(["--foreground"], 0.2),
            opacity: 0.2,
          },
        ] satisfies WaveConfig[],
      };
    };

    let themeColors = computeThemeColors();

    const handleThemeMutation = () => {
      themeColors = computeThemeColors();
    };

    const observer = new MutationObserver(handleThemeMutation);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const mouseInfluence = prefersReducedMotion ? 10 : 70;
    const influenceRadius = prefersReducedMotion ? 160 : 320;
    const smoothing = prefersReducedMotion ? 0.04 : 0.1;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    const recenterMouse = () => {
      const centerPoint = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = centerPoint;
      targetMouseRef.current = centerPoint;
    };

    const handleResize = () => {
      resizeCanvas();
      recenterMouse();
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseLeave = () => {
      recenterMouse();
    };

    resizeCanvas();
    recenterMouse();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const drawWave = (wave: WaveConfig) => {
      context.save();
      context.beginPath();

      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const mouseEffect =
          influence *
          mouseInfluence *
          Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) *
            wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) *
            (wave.amplitude * 0.45) +
          mouseEffect;

        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.lineWidth = 2.5;
      context.strokeStyle = wave.color;
      context.globalAlpha = wave.opacity;
      context.shadowBlur = 35;
      context.shadowColor = wave.color;
      context.stroke();
      context.restore();
    };

    const animate = () => {
      time += 1;

      mouseRef.current.x +=
        (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y +=
        (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, themeColors.backgroundTop);
      gradient.addColorStop(1, themeColors.backgroundBottom);

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      themeColors.wavePalette.forEach(drawWave);

      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <section
        className={cn(
          "relative isolate flex w-full items-center justify-center overflow-hidden bg-background",
          className,
        )}
        aria-label="My Tailor & Fabrics hero section"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground/[0.05] blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-foreground/[0.04] blur-[120px]" />
          <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-primary/[0.05] blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <m.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/75"
            >
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              {eyebrow}
            </m.div>

            <m.h1
              variants={itemVariants}
              className="mx-auto mb-6 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl"
            >
              {title}
            </m.h1>

            <m.p
              variants={itemVariants}
              className="mx-auto mb-10 max-w-3xl text-lg leading-8 text-foreground/70 md:text-2xl"
            >
              {description}
            </m.p>

            <m.div
              variants={itemVariants}
              className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              {primaryCta}
              {secondaryCta}
            </m.div>

            <m.ul
              variants={itemVariants}
              className="mb-12 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-foreground/75"
            >
              {pills.map((pill) => (
                <li
                  key={pill}
                  className="rounded-full border border-border/60 bg-background/75 px-4 py-2 backdrop-blur"
                >
                  {pill}
                </li>
              ))}
            </m.ul>

            <m.div
              variants={statsVariants}
              className="grid gap-4 rounded-2xl border border-border/60 bg-background/75 p-6 backdrop-blur-sm sm:grid-cols-3"
            >
              {stats.map((stat) => (
                <m.div
                  key={stat.label}
                  variants={itemVariants}
                  className="space-y-1"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-foreground/55">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-semibold text-foreground">
                    {stat.prefix ?? ""}
                    {stat.value}
                    {stat.suffix ?? ""}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {stat.caption}
                  </p>
                </m.div>
              ))}
            </m.div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
