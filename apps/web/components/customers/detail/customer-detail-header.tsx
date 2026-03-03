import { ArrowLeft, Edit2 } from "lucide-react";
import { type Customer } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

interface CustomerDetailHeaderProps {
  customer: Customer;
  onBack: () => void;
  onEdit: () => void;
}

export function CustomerDetailHeader({
  customer,
  onBack,
  onEdit,
}: CustomerDetailHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Button variant="tableIcon" size="iconSm" onClick={onBack} className="shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        <PageHeader
          title={customer.fullName}
          description={
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-bold tracking-tight">
                {customer.sizeNumber}
              </Badge>
              <span>•</span>
              <span>{customer.phone}</span>
            </div>
          }
          actions={
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          }
        />
      </div>
    </div>
  );
}
