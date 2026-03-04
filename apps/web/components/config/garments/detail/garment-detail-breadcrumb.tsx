import { EntityBreadcrumb } from "@/components/ui/entity-breadcrumb";

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
      currentClassName="truncate"
      onBack={onBack}
    />
  );
}
