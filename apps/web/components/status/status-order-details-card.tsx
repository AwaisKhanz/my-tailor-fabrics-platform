import { type Order } from "@tbms/shared-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { FieldLabel } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Text } from "@tbms/ui/components/typography";
import { formatPKR } from "@/lib/utils";

interface StatusOrderDetailsCardProps {
  order: Order;
}

export function StatusOrderDetailsCard({ order }: StatusOrderDetailsCardProps) {
  const detailTiles = [
    {
      label: "Customer",
      value: order.customer?.fullName ?? "--",
      tone: "secondary" as const,
    },
    {
      label: "Due Date",
      value: new Date(order.dueDate).toLocaleDateString("en-PK"),
      tone: "secondary" as const,
    },
    {
      label: "Total",
      value: formatPKR(order.totalAmount),
      tone: "secondary" as const,
    },
    {
      label: "Balance Due",
      value: formatPKR(order.balanceDue),
      tone: order.balanceDue > 0 ? ("destructive" as const) : ("success" as const),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {detailTiles.map((tile) => (
          <InfoTile key={tile.label} tone={tile.tone} padding="content">
            <FieldLabel as="span" size="compact" block>
              {tile.label}
            </FieldLabel>
            <Text className="font-medium">{tile.value}</Text>
          </InfoTile>
        ))}
      </CardContent>
    </Card>
  );
}
