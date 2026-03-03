import { ChevronRight } from "lucide-react";

interface GarmentDetailBreadcrumbProps {
  garmentName: string;
  onBack: () => void;
}

export function GarmentDetailBreadcrumb({
  garmentName,
  onBack,
}: GarmentDetailBreadcrumbProps) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onBack}
      >
        Garments
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="truncate font-medium text-foreground">{garmentName}</span>
    </div>
  );
}
