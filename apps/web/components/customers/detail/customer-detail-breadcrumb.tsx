import { EntityBreadcrumb } from "@/components/ui/entity-breadcrumb";

interface CustomerDetailBreadcrumbProps {
  sizeNumber: string;
  onBack: () => void;
}

export function CustomerDetailBreadcrumb({
  sizeNumber,
  onBack,
}: CustomerDetailBreadcrumbProps) {
  return <EntityBreadcrumb sectionLabel="Customers" currentLabel={sizeNumber} onBack={onBack} />;
}
