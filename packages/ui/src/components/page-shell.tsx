import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@tbms/ui/lib/utils";

const pageShellVariants = cva("mx-auto w-full", {
  variants: {
    width: {
      full: "max-w-full",
      dashboard: "max-w-[1680px]",
      content: "max-w-7xl",
      narrow: "max-w-5xl",
    },
    spacing: {
      compact: "space-y-4 lg:space-y-5",
      default: "space-y-2 lg:space-y-4",
      spacious: "space-y-8 lg:space-y-9",
    },
    inset: {
      none: "",
      default: "pb-12",
      relaxed: "pb-16",
    },
    viewport: {
      default: "",
      screen: "min-h-screen px-4 py-6 sm:px-6 sm:py-8",
      screenRoomy: "min-h-screen px-4 py-8 sm:px-6 sm:py-10",
    },
  },
  defaultVariants: {
    width: "dashboard",
    spacing: "default",
    inset: "default",
    viewport: "default",
  },
});

interface PageShellProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageShellVariants> {}

export function PageShell({
  className,
  width,
  spacing,
  inset,
  viewport,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        pageShellVariants({ width, spacing, inset, viewport, className }),
      )}
      {...props}
    />
  );
}

const pageSectionVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "",
      compact: "space-y-3",
      default: "space-y-4 lg:space-y-5",
      spacious: "space-y-6 lg:space-y-7",
    },
    layout: {
      default: "",
      center: "flex min-h-[70vh] items-center justify-center",
    },
  },
  defaultVariants: {
    spacing: "default",
    layout: "default",
  },
});

interface PageSectionProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof pageSectionVariants> {
  as?: React.ElementType;
}

export function PageSection({
  as: Component = "section",
  className,
  spacing,
  layout,
  ...props
}: PageSectionProps) {
  return (
    <Component
      className={cn(pageSectionVariants({ spacing, layout, className }))}
      {...props}
    />
  );
}

type DetailSplitRatio = "2-1" | "3-1" | "3-2";

interface DetailSplitProps extends React.HTMLAttributes<HTMLDivElement> {
  main: React.ReactNode;
  side: React.ReactNode;
  ratio?: DetailSplitRatio;
  gap?: "default" | "spacious";
  mainClassName?: string;
  sideClassName?: string;
}

const detailGridByRatio: Record<DetailSplitRatio, string> = {
  "2-1": "lg:grid-cols-3",
  "3-1": "lg:grid-cols-4",
  "3-2": "lg:grid-cols-5",
};

const detailMainByRatio: Record<DetailSplitRatio, string> = {
  "2-1": "lg:col-span-2",
  "3-1": "lg:col-span-3",
  "3-2": "lg:col-span-3",
};

const detailSideByRatio: Record<DetailSplitRatio, string> = {
  "2-1": "lg:col-span-1",
  "3-1": "lg:col-span-1",
  "3-2": "lg:col-span-2",
};

export function DetailSplit({
  main,
  side,
  ratio = "2-1",
  gap = "default",
  className,
  mainClassName,
  sideClassName,
  ...props
}: DetailSplitProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 ",
        gap === "spacious" ? "gap-8" : "gap-6",
        detailGridByRatio[ratio],
        className,
      )}
      {...props}
    >
      <div className={cn(detailMainByRatio[ratio], mainClassName)}>{main}</div>
      <aside className={cn(detailSideByRatio[ratio], sideClassName)}>
        {side}
      </aside>
    </div>
  );
}
