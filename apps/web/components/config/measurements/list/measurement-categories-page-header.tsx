import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface MeasurementCategoriesPageHeaderProps {
  onAdd: () => void;
  canCreate?: boolean;
}

export function MeasurementCategoriesPageHeader({
  onAdd,
  canCreate = true,
}: MeasurementCategoriesPageHeaderProps) {
  return (
    <PageHeader
      title="Measurement Configuration"
      description="Define and manage measurement fields for your tailoring categories."
      actions={canCreate ? (
        <Button variant="premium" size="lg" onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          New Category
        </Button>
      ) : null}
    />
  );
}
