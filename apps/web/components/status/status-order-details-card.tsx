import { type Order } from "@tbms/shared-types";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface StatusOrderDetailsCardProps {
  order: Order;
}

export function StatusOrderDetailsCard({ order }: StatusOrderDetailsCardProps) {
  return (
    <Card variant="premium" className="space-y-3 p-6">
      <Typography as="h2" variant="muted" className="font-semibold uppercase tracking-wide">
        Details
      </Typography>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <Typography as="p" variant="muted" className="text-xs">
            Customer
          </Typography>
          <Typography as="p" variant="body" className="font-medium">
            {order.customer?.fullName}
          </Typography>
        </div>

        <div>
          <Typography as="p" variant="muted" className="text-xs">
            Due Date
          </Typography>
          <Typography as="p" variant="body" className="font-medium">
            {new Date(order.dueDate).toLocaleDateString("en-PK")}
          </Typography>
        </div>

        <div>
          <Typography as="p" variant="muted" className="text-xs">
            Total
          </Typography>
          <Typography as="p" variant="body" className="font-medium">
            {formatPKR(order.totalAmount)}
          </Typography>
        </div>

        <div>
          <Typography as="p" variant="muted" className="text-xs">
            Balance Due
          </Typography>
          <Typography as="p" variant="body" className="font-medium text-destructive">
            {formatPKR(order.balanceDue)}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
