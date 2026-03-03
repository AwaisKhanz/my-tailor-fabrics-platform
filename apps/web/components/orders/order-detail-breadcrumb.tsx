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
    <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      <button
        type="button"
        className="transition-colors hover:text-primary"
        onClick={onBack}
      >
        Order Index
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground">{orderNumber}</span>
    </div>
  );
}
