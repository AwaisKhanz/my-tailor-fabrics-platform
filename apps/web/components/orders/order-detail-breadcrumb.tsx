import { ChevronRight } from "lucide-react";

interface OrderDetailBreadcrumbProps {
  orderNumber: string;
  onBack: () => void;
}

export function OrderDetailBreadcrumb({
  orderNumber,
  onBack,
}: OrderDetailBreadcrumbProps) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onBack}
      >
        Orders
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-foreground">{orderNumber}</span>
    </div>
  );
}
