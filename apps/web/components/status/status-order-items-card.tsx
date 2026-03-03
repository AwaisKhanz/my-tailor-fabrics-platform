import { type Order } from "@tbms/shared-types";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface StatusOrderItemsCardProps {
  order: Order;
}

export function StatusOrderItemsCard({ order }: StatusOrderItemsCardProps) {
  return (
    <Card variant="premium" className="space-y-3 p-6">
      <Typography as="h2" variant="muted" className="font-semibold uppercase tracking-wide">
        Items
      </Typography>

      <div className="divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Typography as="p" variant="body" className="font-medium">
                {item.garmentTypeName}
              </Typography>
              {item.description ? (
                <Typography as="p" variant="muted" className="text-xs">
                  {item.description}
                </Typography>
              ) : null}
            </div>

            <div className="text-left sm:text-right">
              <Typography as="p" variant="body" className="font-medium">
                x{item.quantity}
              </Typography>
              <Typography as="p" variant="muted" className="text-xs">
                {formatPKR(item.unitPrice * item.quantity)}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
