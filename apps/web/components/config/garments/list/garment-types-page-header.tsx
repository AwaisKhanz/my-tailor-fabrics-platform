import { Plus } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";

interface GarmentTypesPageHeaderProps {
  onAdd: () => void;
  canCreate?: boolean;
}

export function GarmentTypesPageHeader({
  onAdd,
  canCreate = true,
}: GarmentTypesPageHeaderProps) {
  return (
    <PageHeader
      title="Garment Management"
      description="Combine measurement forms, customer pricing, and workflow setup into the garments your staff will actually sell."
      actions={
        canCreate ? (
          <Button variant="default" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add New Garment Type
          </Button>
        ) : null
      }
    />
  );
}
