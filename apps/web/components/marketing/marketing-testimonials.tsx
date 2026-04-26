"use client";

import { useMemo, useState } from "react";
import { Quote } from "lucide-react";

import { Avatar, AvatarFallback } from "@tbms/ui/components/avatar";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent } from "@tbms/ui/components/card";

import { cn } from "@/lib/utils";
import type { MarketingTestimonial } from "@/lib/marketing-content";

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "MT";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function MarketingTestimonials({
  testimonials,
  className,
  title = "What customers notice.",
  description = "Short notes from customers who came for fit and finishing.",
  eyebrow = "Reviews",
  maxDisplayed = 6,
}: {
  testimonials: MarketingTestimonial[];
  className?: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  maxDisplayed?: number;
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleTestimonials = useMemo(
    () => testimonials.slice(0, showAll ? undefined : maxDisplayed),
    [maxDisplayed, showAll, testimonials],
  );

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <div className="inline-flex w-fit items-center rounded-full border border-border px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-foreground">
          {eyebrow}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className={cn(
            "grid gap-5 md:grid-cols-2 xl:grid-cols-3",
            !showAll &&
              testimonials.length > maxDisplayed &&
              "max-h-[760px] overflow-hidden",
          )}
        >
          {visibleTestimonials.map((testimonial) => (
            <Card
              key={`${testimonial.customer}-${testimonial.context}`}
              className="h-full rounded-3xl border-border/70 bg-card/85"
            >
              <CardContent className="relative flex h-full flex-col gap-5 p-6">
                <Quote className="absolute right-5 top-5 h-5 w-5 text-primary/60" />

                <div className="flex items-center gap-4">
                  <Avatar size="lg" className="ring-1 ring-border/70">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {getInitials(testimonial.customer)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">
                      {testimonial.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.context}
                    </p>
                  </div>
                </div>

                <p className="text-base leading-7 text-foreground">
                  “{testimonial.quote}”
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {testimonials.length > maxDisplayed && !showAll ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-6 flex justify-center">
              <Button variant="secondary" onClick={() => setShowAll(true)}>
                Load More
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
