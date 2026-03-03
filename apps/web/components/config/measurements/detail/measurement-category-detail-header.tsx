import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface MeasurementCategoryDetailHeaderProps {
  categoryName?: string;
  onAddField: () => void;
}

export function MeasurementCategoryDetailHeader({
  categoryName,
  onAddField,
}: MeasurementCategoryDetailHeaderProps) {
  return (
    <PageHeader
      title={`${categoryName || "Category"} Fields`}
      description="Manage specific measurement fields for this apparel category."
      actions={
        <Button variant="premium" size="lg" onClick={onAddField}>
          <Plus className="mr-2 h-5 w-5" />
          Add New Field
        </Button>
      }
    />
  );
}
