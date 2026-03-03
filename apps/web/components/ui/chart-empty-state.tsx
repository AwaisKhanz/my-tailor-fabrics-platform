import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartEmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function ChartEmptyState({ title, description, icon: Icon, className }: ChartEmptyStateProps) {
  return (
    <div className={cn("flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 px-6 py-10 text-center", className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
