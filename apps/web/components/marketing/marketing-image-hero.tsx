import type { ReactNode } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MarketingStat } from "@/lib/marketing-content";

export function MarketingImageHero({
  eyebrow,
  title,
  description,
  pills,
  stats,
  primaryCta,
  secondaryCta,
  backgroundImage,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  pills: readonly string[];
  stats: readonly MarketingStat[];
  primaryCta: ReactNode;
  secondaryCta: ReactNode;
  backgroundImage: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex w-full items-center justify-center overflow-hidden bg-background",
        className,
      )}
      aria-label="My Tailor & Fabrics hero section"
    >
      <Image
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        priority
        fill
        unoptimized
        sizes="100vw"
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-20 bg-background/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/70 via-background/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center md:px-8 lg:px-12 lg:py-24">
        <div className="w-full">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/75 backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            {eyebrow}
          </div>

          <h1 className="mx-auto mb-5 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            {description}
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryCta}
            {secondaryCta}
          </div>

          <ul className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/75">
            {pills.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-border/60 bg-background/75 px-4 py-2 backdrop-blur"
              >
                {pill}
              </li>
            ))}
          </ul>

          <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/75 p-5 backdrop-blur-sm sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <div className="text-xs uppercase tracking-[0.3em] text-foreground/55">
                  {stat.label}
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {stat.prefix ?? ""}
                  {stat.value}
                  {stat.suffix ?? ""}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {stat.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
