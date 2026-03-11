import { EntityBreadcrumb } from "@tbms/ui/components/entity-breadcrumb";

interface OrderDetailBreadcrumbProps {
  orderNumber: string;
  onBack: () => void;
}

export function OrderDetailBreadcrumb({
  orderNumber,
  onBack,
}: OrderDetailBreadcrumbProps) {
  return <EntityBreadcrumb sectionLabel="Orders" currentLabel={orderNumber} onBack={onBack} />;
}
