import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { cn } from "@/lib/utils";

const statusPageFrameVariants = cva("min-h-screen bg-background", {
  variants: {
    layout: {
      centered: "flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10",
      content: "px-4 py-6 sm:py-8",
    },
  },
  defaultVariants: {
    layout: "content",
  },
});

type StatusPageWidth = "full" | "narrow";

export interface StatusPageFrameProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof statusPageFrameVariants> {
  children: React.ReactNode;
  width?: StatusPageWidth;
  sectionClassName?: string;
}

export function StatusPageFrame({
  children,
  className,
  layout,
  width = "narrow",
  sectionClassName,
  ...props
}: StatusPageFrameProps) {
  if (layout === "centered") {
    return (
      <PageShell
        width={width}
        spacing="compact"
        inset="none"
        className={cn(statusPageFrameVariants({ layout, className }))}
        {...props}
      >
        {children}
      </PageShell>
    );
  }

  return (
    <PageShell
      width={width}
      spacing="compact"
      inset="none"
      className={cn(statusPageFrameVariants({ layout, className }))}
      {...props}
    >
      <PageSection spacing="compact" className={sectionClassName}>
        {children}
      </PageSection>
    </PageShell>
  );
}
