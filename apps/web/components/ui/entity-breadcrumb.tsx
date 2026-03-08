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
        "mb-1 flex items-center gap-2 text-xs font-semibold uppercase  text-muted-foreground",
        className,
      )}
    >
      <button
        type="button"
        className="rounded-md px-1 py-0.5 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={onBack}
      >
        {sectionLabel}
      </button>
      <ChevronRight className={cn("h-3 w-3", separatorClassName)} />
      <span className={cn("font-medium text-foreground", currentClassName)}>
        {currentLabel}
      </span>
    </div>
  );
}
