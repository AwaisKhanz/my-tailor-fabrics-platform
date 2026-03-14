import * as React from "react";
import { Search } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@tbms/ui/components/badge";
import { DecorIcon } from "@tbms/ui/components/decor-icon";
import { Input } from "@tbms/ui/components/input";
import { Heading } from "@tbms/ui/components/typography";
import { cn } from "@tbms/ui/lib/utils";

const tableSurfaceVariants = cva(
  "group/table-surface relative isolate overflow-hidden rounded-lg border border-border/80 bg-linear-to-b from-background via-card via-65% to-muted/30 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.9),0_1px_2px_0_hsl(0_0%_0%/0.06),0_20px_44px_-26px_hsl(0_0%_0%/0.24)] dark:border-white/12 dark:bg-card dark:[background-image:linear-gradient(180deg,hsl(0_0%_100%/.04),transparent_24%),radial-gradient(58%_86%_at_14%_0%,hsl(0_0%_100%/.10),transparent_60%)] dark:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.14),0_1px_2px_0_hsl(0_0%_0%/0.42),0_18px_40px_-24px_hsl(0_0%_0%/0.72)]",
  {
    variants: {
      shadow: {
        default: "shadow-sm",
        none: "shadow-none",
      },
    },
    defaultVariants: {
      shadow: "default",
    },
  },
);

export interface TableSurfaceProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableSurfaceVariants> {
  children: React.ReactNode;
}

export type TableToolbarProps = {
  title: string;
  total: number;
  totalLabel?: string;
  activeFilterCount?: number;
  controls?: React.ReactNode;
  className?: string;
} & VariantProps<typeof tableToolbarVariants>;

const tableToolbarVariants = cva("border-b border-border px-4 py-5", {
  variants: {
    surface: {
      secondary: "bg-transparent",
      muted: "bg-muted/30",
      card: "bg-transparent",
    },
    density: {
      default: "",
      compact: "px-4 py-4",
    },
  },
  defaultVariants: {
    surface: "secondary",
    density: "default",
  },
});

export type TableSearchProps = React.ComponentProps<typeof Input> & {
  icon?: React.ReactNode;
};

export function TableSurface({
  children,
  className,
  shadow,
  ...props
}: TableSurfaceProps) {
  return (
    <div className={cn(tableSurfaceVariants({ shadow }), className)} {...props}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_100%,hsl(0_0%_0%/.045),transparent_38%)] dark:bg-[radial-gradient(100%_100%_at_0%_0%,hsl(0_0%_100%/.05),transparent_42%)]" />
        <div className="absolute inset-y-6 left-0 w-px bg-border/80" />
        <div className="absolute inset-y-6 right-0 w-px bg-border/80" />
        <div className="absolute inset-x-6 top-0 h-px bg-border/80" />
        <div className="absolute inset-x-6 bottom-0 h-px bg-border/80" />
        <DecorIcon position="top-right" className="stroke-border" />
        <DecorIcon position="bottom-left" className="stroke-border" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function TableToolbar({
  title,
  total,
  totalLabel = "results",
  activeFilterCount,
  controls,
  className,
  surface,
  density,
}: TableToolbarProps) {
  const hasActiveFilters = Boolean(activeFilterCount && activeFilterCount > 0);

  return (
    <div className={cn(tableToolbarVariants({ surface, density }), className)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Heading as="h2" variant="section">
            {title}
          </Heading>
          <Badge variant="secondary">
            {total} {totalLabel}
          </Badge>
          {hasActiveFilters ? (
            <Badge variant="outline" className="font-bold">
              {activeFilterCount} active filter
              {activeFilterCount && activeFilterCount > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>

        {controls ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {controls}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TableSearch({ icon, className, ...props }: TableSearchProps) {
  return (
    <div className="group relative w-full md:min-w-[280px] md:flex-1">
      <Input className={cn("pl-9", className)} {...props} />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-foreground">
        {icon ?? <Search className="h-4 w-4" />}
      </span>
    </div>
  );
}
