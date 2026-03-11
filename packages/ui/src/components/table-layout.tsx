import * as React from "react";
import { Search } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@tbms/ui/components/badge";
import { Input } from "@tbms/ui/components/input";
import { Heading } from "@tbms/ui/components/typography";
import { cn } from "@tbms/ui/lib/utils";

const tableSurfaceVariants = cva(
  "overflow-hidden rounded-2xl border border-border bg-card",
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
      secondary: "bg-card",
      muted: "bg-muted",
      card: "bg-card",
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
