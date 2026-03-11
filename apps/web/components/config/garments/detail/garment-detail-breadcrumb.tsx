import { EntityBreadcrumb } from "@tbms/ui/components/entity-breadcrumb";

interface GarmentDetailBreadcrumbProps {
  garmentName: string;
  onBack: () => void;
}

export function GarmentDetailBreadcrumb({
  garmentName,
  onBack,
}: GarmentDetailBreadcrumbProps) {
  return (
    <EntityBreadcrumb
      sectionLabel="Garments"
      currentLabel={garmentName}
      separatorClassName="text-muted-foreground"
      currentClassName="max-w-[260px] truncate"
      onBack={onBack}
    />
  );
}
