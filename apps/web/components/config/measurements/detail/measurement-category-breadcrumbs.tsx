import { ChevronRight } from "lucide-react";

interface MeasurementCategoryBreadcrumbsProps {
  categoryName?: string;
  onBack: () => void;
}

export function MeasurementCategoryBreadcrumbs({
  categoryName,
  onBack,
}: MeasurementCategoryBreadcrumbsProps) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onBack}
      >
        Measurements
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="truncate font-medium text-foreground">
        {categoryName || "Category"}
      </span>
    </div>
  );
}
