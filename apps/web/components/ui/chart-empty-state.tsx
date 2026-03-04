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
    <div className={cn("flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-divider bg-surface-elevated px-6 py-10 text-center", className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-divider bg-muted text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-text-secondary">{description}</p>
    </div>
  );
}
