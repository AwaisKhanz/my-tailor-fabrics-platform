import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

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
      description="Configure garment types, inventory pricing models, and production rates."
      actions={canCreate ? (
        <Button variant="premium" size="lg" onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Add New Garment Type
        </Button>
      ) : null}
    />
  );
}
