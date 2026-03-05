import * as React from "react";
import { Search } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const tableSurfaceVariants = cva(
  "overflow-hidden rounded-xl border border-borderStrong/70 bg-card shadow-[0_1px_2px_hsl(var(--shadow-color)/0.08)]",
  {
    variants: {
      variant: {
        default: "",
        flat: "shadow-none",
        elevated: "bg-surface-elevated shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type TableSurfaceProps = {
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof tableSurfaceVariants>;

export type TableToolbarProps = {
  title: string;
  total: number;
  totalLabel?: string;
  activeFilterCount?: number;
  controls?: React.ReactNode;
  className?: string;
};

export type TableSearchProps = React.ComponentProps<typeof Input> & {
  icon?: React.ReactNode;
};

export function TableSurface({
  children,
  className,
  variant,
}: TableSurfaceProps) {
  return (
    <div className={cn(tableSurfaceVariants({ variant, className }))}>
      {children}
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
}: TableToolbarProps) {
  const hasActiveFilters = Boolean(activeFilterCount && activeFilterCount > 0);

  return (
    <div
      className={cn(
        "border-b border-divider bg-surface-elevated px-4 py-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h2" variant="sectionTitle">
            {title}
          </Typography>
          <Badge variant="secondary" size="xs" className="ring-1 ring-divider">
            {total} {totalLabel}
          </Badge>
          {hasActiveFilters ? (
            <Badge variant="outline" size="xs" className="font-bold">
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

export function TableSearch({
  icon,
  className,
  variant = "table",
  ...props
}: TableSearchProps) {
  return (
    <div className="group relative w-full md:min-w-[280px] md:flex-1">
      <Input variant={variant} className={cn("pl-9", className)} {...props} />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-hover:text-primary">
        {icon ?? <Search className="h-4 w-4" />}
      </span>
    </div>
  );
}
