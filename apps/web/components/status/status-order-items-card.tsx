import { type Order } from "@tbms/shared-types";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface StatusOrderItemsCardProps {
  order: Order;
}

export function StatusOrderItemsCard({ order }: StatusOrderItemsCardProps) {
  return (
    <Card className="space-y-3 p-6">
      <Heading
        as="h2"
        variant="section"
        className="text-sm font-semibold uppercase  text-muted-foreground"
      >
        Items
      </Heading>

      <div className="divide-y">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Text as="p" variant="body" className="font-medium">
                {item.garmentTypeName}
              </Text>
              {item.description ? (
                <Text as="p" variant="muted" className="text-xs">
                  {item.description}
                </Text>
              ) : null}
            </div>

            <div className="text-left sm:text-right">
              <Text as="p" variant="body" className="font-medium">
                x{item.quantity}
              </Text>
              <Text as="p" variant="muted" className="text-xs">
                {formatPKR(item.unitPrice * item.quantity)}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
