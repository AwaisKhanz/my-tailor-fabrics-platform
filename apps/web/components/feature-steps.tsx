"use client";

import React, { useState, useEffect } from "react";
import { LazyMotion, domMax, m } from "motion/react";
import Image from "next/image";
import { cn } from "@tbms/ui/lib/utils";

interface Feature {
  step?: string;
  title: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  autoPlayInterval?: number;
  imageClassName?: string;
}

export default function FeatureSteps({
  features,
  className,
  autoPlayInterval = 3000,
  imageClassName = "h-[400px]",
}: FeatureStepsProps) {
  const [state, setState] = useState({ feature: 0, tick: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => ({
        feature: (prev.feature + 1) % features.length,
        tick: prev.tick + 1,
      }));
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlayInterval, state.feature, features.length]);

  const currentFeature = state.feature;
  const progressKey = state.tick;

  return (
    <LazyMotion features={domMax}>
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1440px] flex-col md:flex-row md:items-stretch",
          className
        )}
      >
        <div className="flex w-full flex-col divide-y divide-border/70 border border-border/70 md:w-1/2">
          {features.map((feature, index) => (
            <m.div
              key={feature.title}
              layoutId={feature.title}
              onClick={() => {
                setState((prev) => ({ feature: index, tick: prev.tick + 1 }));
              }}
              className="relative cursor-pointer bg-card/80 p-4 transition-colors hover:bg-muted/40 md:p-10"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {feature.step ?? `Step ${index + 1}`}
              </p>
              <h3 className="text-base leading-none text-foreground md:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.content}
              </p>
              {index === currentFeature && (
                <m.div
                  key={progressKey}
                  className="absolute bottom-0 left-0 h-[2px] bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: autoPlayInterval / 1000,
                    ease: "easeIn",
                  }}
                />
              )}
            </m.div>
          ))}
        </div>

        <div
          className={cn(
            "relative w-full overflow-hidden border border-t-0 border-border/70 bg-card/80 p-4 md:w-1/2 md:border-l-0 md:border-t md:p-5",
            imageClassName
          )}
        >
          <m.div
            key={currentFeature}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={features[currentFeature].image}
              alt={features[currentFeature].title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded object-cover"
            />
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
