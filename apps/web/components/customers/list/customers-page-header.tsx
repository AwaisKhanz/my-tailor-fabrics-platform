import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface CustomersPageHeaderProps {
  onAddCustomer: () => void;
}

export function CustomersPageHeader({ onAddCustomer }: CustomersPageHeaderProps) {
  return (
    <PageHeader
      title="Customer Management"
      description="Manage and track your tailoring clients and their measurement history."
      actions={
        <Button
          onClick={onAddCustomer}
          variant="premium"
          size="lg"
          className="w-full gap-2 sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          Add New Customer
        </Button>
      }
    />
  );
}
