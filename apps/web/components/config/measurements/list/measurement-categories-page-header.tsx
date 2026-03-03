import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface MeasurementCategoriesPageHeaderProps {
  onAdd: () => void;
}

export function MeasurementCategoriesPageHeader({ onAdd }: MeasurementCategoriesPageHeaderProps) {
  return (
    <PageHeader
      title="Measurement Configuration"
      description="Define and manage measurement fields for your tailoring categories."
      actions={
        <Button variant="premium" size="lg" onClick={onAdd}>
          <Plus className="mr-2 h-5 w-5" />
          New Category
        </Button>
      }
    />
  );
}
