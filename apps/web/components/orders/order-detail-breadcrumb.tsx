import { EntityBreadcrumb } from "@/components/ui/entity-breadcrumb";

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
