import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@tbms/ui/components/button";

interface MeasurementCategoryBreadcrumbsProps {
  categoryName?: string;
  onBack: () => void;
}

export function MeasurementCategoryBreadcrumbs({
  categoryName,
  onBack,
}: MeasurementCategoryBreadcrumbsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <span>Measurements</span>
      <ChevronRight className="h-4 w-4" />
      <span className="max-w-[240px] truncate font-medium text-foreground">
        {categoryName || "Category"}
      </span>
    </div>
  );
}
