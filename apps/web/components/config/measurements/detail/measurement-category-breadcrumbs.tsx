import { EntityBreadcrumb } from "@/components/ui/entity-breadcrumb";

interface MeasurementCategoryBreadcrumbsProps {
  categoryName?: string;
  onBack: () => void;
}

export function MeasurementCategoryBreadcrumbs({
  categoryName,
  onBack,
}: MeasurementCategoryBreadcrumbsProps) {
  return (
    <EntityBreadcrumb
      sectionLabel="Measurements"
      currentLabel={categoryName || "Category"}
      currentClassName="truncate"
      onBack={onBack}
    />
  );
}
