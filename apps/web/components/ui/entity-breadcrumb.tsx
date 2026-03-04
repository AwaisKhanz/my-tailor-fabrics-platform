import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityBreadcrumbProps {
  sectionLabel: string;
  currentLabel: string;
  onBack: () => void;
  className?: string;
  currentClassName?: string;
  separatorClassName?: string;
}

export function EntityBreadcrumb({
  sectionLabel,
  currentLabel,
  onBack,
  className,
  currentClassName,
  separatorClassName,
}: EntityBreadcrumbProps) {
  return (
    <div
      className={cn(
        "mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-text-secondary",
        className,
      )}
    >
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-interaction-focus"
        onClick={onBack}
      >
        {sectionLabel}
      </button>
      <ChevronRight className={cn("h-3 w-3", separatorClassName)} />
      <span className={cn("font-medium text-text-primary", currentClassName)}>{currentLabel}</span>
    </div>
  );
}
