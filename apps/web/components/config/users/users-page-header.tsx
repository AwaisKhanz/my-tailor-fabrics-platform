import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface UsersPageHeaderProps {
  onAddUser: () => void;
}

export function UsersPageHeader({ onAddUser }: UsersPageHeaderProps) {
  return (
    <PageHeader
      title="User Management"
      description="Manage staff access levels, branch assignments, and account security."
      actions={
        <Button
          variant="default"
          size="lg"
          className="w-full sm:w-auto"
          onClick={onAddUser}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Staff Member
        </Button>
      }
    />
  );
}
