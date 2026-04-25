import { Plus } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";

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
      description="Define the real tailoring fields your team needs before garments and customer profiles can be set up properly."
      actions={
        canCreate ? (
          <Button variant="default" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        ) : null
      }
    />
  );
}
