import { ChevronRight } from "lucide-react";

interface CustomerDetailBreadcrumbProps {
  sizeNumber: string;
  onBack: () => void;
}

export function CustomerDetailBreadcrumb({
  sizeNumber,
  onBack,
}: CustomerDetailBreadcrumbProps) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onBack}
      >
        Customers
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-foreground">{sizeNumber}</span>
    </div>
  );
}
