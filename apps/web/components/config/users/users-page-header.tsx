import { Plus } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";

interface UsersPageHeaderProps {
  onAddUser: () => void;
}

export function UsersPageHeader({ onAddUser }: UsersPageHeaderProps) {
  return (
    <PageHeader
      title="User Management"
      description="Manage staff access levels, branch assignments, and account security."
      actions={
        <Button variant="default" onClick={onAddUser}>
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      }
    />
  );
}
