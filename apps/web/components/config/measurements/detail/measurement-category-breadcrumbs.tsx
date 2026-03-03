import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

interface MeasurementCategoryBreadcrumbsProps {
  categoryName?: string;
}

export function MeasurementCategoryBreadcrumbs({
  categoryName,
}: MeasurementCategoryBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      <Link href="/settings" className="transition-colors hover:text-primary">
        Settings
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/settings/measurements" className="transition-colors hover:text-primary">
        Measurements
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Label variant="dashboard" className="text-primary opacity-100">
        {categoryName || "Category"}
      </Label>
    </nav>
  );
}
