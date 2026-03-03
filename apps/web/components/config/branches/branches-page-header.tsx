import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface BranchesPageHeaderProps {
  onCreate: () => void;
}

export function BranchesPageHeader({ onCreate }: BranchesPageHeaderProps) {
  return (
    <PageHeader
      title="Branch Management"
      description="Configure and oversee all physical organizational locations and their status."
      actions={
        <Button variant="premium" size="lg" onClick={onCreate}>
          <Plus className="mr-2 h-5 w-5" />
          Add New Branch
        </Button>
      }
    />
  );
}
