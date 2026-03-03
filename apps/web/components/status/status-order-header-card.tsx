import { type BadgeVariant, type Order } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

interface StatusOrderHeaderCardProps {
  order: Order;
  label: string;
  variant: BadgeVariant;
  icon: React.ElementType;
}

export function StatusOrderHeaderCard({
  order,
  label,
  variant,
  icon: Icon,
}: StatusOrderHeaderCardProps) {
  return (
    <Card variant="premium" className="p-6 text-center">
      <Typography as="p" variant="muted" className="mb-1 text-xs">
        Order Number
      </Typography>
      <Typography as="h1" variant="pageTitle" className="text-2xl text-primary">
        {order.orderNumber}
      </Typography>

      <div className="mt-3 flex justify-center">
        <Badge variant={variant} className="px-4 py-1.5 text-sm font-semibold uppercase tracking-wider">
          <Icon className="mr-1.5 h-4 w-4" />
          {label}
        </Badge>
      </div>
    </Card>
  );
}
