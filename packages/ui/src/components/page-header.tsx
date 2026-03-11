import * as React from "react";
import { cva } from "class-variance-authority";
import { Heading, Text } from "@tbms/ui/components/typography";
import { cn } from "@tbms/ui/lib/utils";

const pageHeaderVariants = cva("items-start justify-between rounded-lg", {
  variants: {
    layout: {
      stack: "flex flex-col gap-4 sm:flex-row",
      inline: "flex gap-4",
    },
    density: {
      default: "px-5 py-5 sm:px-6 sm:py-6",
      compact: "px-5 py-5 sm:px-6 sm:py-6",
    },
    surface: {
      card: "bg-card",
      muted: "bg-muted",
      secondary: "bg-secondary",
    },
  },
  defaultVariants: {
    layout: "stack",
    density: "default",
    surface: "card",
  },
});

const pageHeaderActionsVariants = cva("w-full sm:w-auto", {
  variants: {
    layout: {
      wrap: "flex flex-wrap items-center gap-2 sm:justify-end",
      inline: "shrink-0",
    },
  },
  defaultVariants: {
    layout: "wrap",
  },
});

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  surface?: "card" | "muted" | "secondary";
  layout?: "stack" | "inline";
  actionLayout?: "wrap" | "inline";
  stackOnMobile?: boolean;
  actionWrap?: boolean;
  density?: "compact" | "default";
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  surface = "card",
  layout,
  actionLayout,
  stackOnMobile = true,
  actionWrap = true,
  density = "default",
}: PageHeaderProps) {
  const resolvedLayout = layout ?? (stackOnMobile ? "stack" : "inline");
  const resolvedActionLayout = actionLayout ?? (actionWrap ? "wrap" : "inline");

  return (
    <div
      data-ui="page-header"
      className={cn(
        pageHeaderVariants({ layout: resolvedLayout, density, surface }),
        className,
      )}
    >
      <div className="min-w-0">
        <Heading as="h4" variant="stat">
          {title}
        </Heading>
        {description ? (
          <Text
            as="div"
            variant="lead"
            className={cn(density === "compact" ? "mt-0.5" : "mt-1")}
          >
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <div
          className={cn(
            pageHeaderActionsVariants({ layout: resolvedActionLayout }),
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
