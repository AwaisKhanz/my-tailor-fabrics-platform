import { Plus } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";

interface BranchesPageHeaderProps {
  onCreate: () => void;
  canCreate?: boolean;
}

export function BranchesPageHeader({
  onCreate,
  canCreate = true,
}: BranchesPageHeaderProps) {
  return (
    <PageHeader
      title="Branch Management"
      description="Configure operational locations, ownership details, and branch visibility in one place."
      actions={
        canCreate ? (
          <Button variant="default" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Add New Branch
          </Button>
        ) : null
      }
    />
  );
}
