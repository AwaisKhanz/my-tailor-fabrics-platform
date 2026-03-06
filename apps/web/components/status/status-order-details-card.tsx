import { type Order } from "@tbms/shared-types";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface StatusOrderDetailsCardProps {
  order: Order;
}

export function StatusOrderDetailsCard({ order }: StatusOrderDetailsCardProps) {
  return (
    <Card className="space-y-3 p-6">
      <Heading
        as="h2"
        variant="section"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Details
      </Heading>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <Text as="p"  variant="muted" className="text-xs">
            Customer
          </Text>
          <Text as="p"  variant="body" className="font-medium">
            {order.customer?.fullName}
          </Text>
        </div>

        <div>
          <Text as="p"  variant="muted" className="text-xs">
            Due Date
          </Text>
          <Text as="p"  variant="body" className="font-medium">
            {new Date(order.dueDate).toLocaleDateString("en-PK")}
          </Text>
        </div>

        <div>
          <Text as="p"  variant="muted" className="text-xs">
            Total
          </Text>
          <Text as="p"  variant="body" className="font-medium">
            {formatPKR(order.totalAmount)}
          </Text>
        </div>

        <div>
          <Text as="p"  variant="muted" className="text-xs">
            Balance Due
          </Text>
          <Text as="p"  variant="body" className="font-medium text-destructive">
            {formatPKR(order.balanceDue)}
          </Text>
        </div>
      </div>
    </Card>
  );
}
