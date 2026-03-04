import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

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
      actions={canCreate ? (
        <Button variant="premium" size="lg" onClick={onCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add New Branch
        </Button>
      ) : null}
    />
  );
}
