"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@tbms/ui/lib/utils";

interface InlineLoaderProps extends React.ComponentProps<typeof Loader2> {
  label?: string;
}

export function InlineLoader({
  className,
  label = "Loading",
  ...props
}: InlineLoaderProps) {
  return (
    <>
      <Loader2 className={cn("h-4 w-4 animate-spin", className)} {...props} />
      <span className="sr-only">{label}</span>
    </>
  );
}
