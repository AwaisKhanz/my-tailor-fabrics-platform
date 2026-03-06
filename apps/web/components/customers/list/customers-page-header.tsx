import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface CustomersPageHeaderProps {
  onAddCustomer: () => void;
  canCreateCustomer?: boolean;
}

export function CustomersPageHeader({
  onAddCustomer,
  canCreateCustomer = true,
}: CustomersPageHeaderProps) {
  return (
    <PageHeader
      title="Customers"
      description="Manage client records, sizing history, and communication status from one directory."
      actions={
        canCreateCustomer ? (
          <Button
            onClick={onAddCustomer}
            variant="default"
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            New Customer
          </Button>
        ) : null
      }
    />
  );
}
