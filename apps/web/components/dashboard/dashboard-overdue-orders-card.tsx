import { Clock } from "lucide-react";
import { OrderStatus, type Order } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface DashboardOverdueOrdersCardProps {
  orders: Order[];
  onViewOverdueOrders: () => void;
  onOpenOrder: (orderId: string) => void;
}

export function DashboardOverdueOrdersCard({
  orders,
  onViewOverdueOrders,
  onOpenOrder,
}: DashboardOverdueOrdersCardProps) {
  return (
    <Card variant="elevatedPanel">
      <CardHeader variant="rowSection">
        <CardTitle variant="dashboardSection">Recent Overdue Orders</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewOverdueOrders}>
          View all
        </Button>
      </CardHeader>
      <CardContent
        spacing="section"
        className="overflow-hidden rounded-b-xl p-0"
      >
        <div className="divide-y divide-divider border-t border-divider">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-interaction-hover sm:grid-cols-[1.3fr_1.4fr_1fr] sm:items-center sm:px-6"
            >
              <div className="min-w-0">
                <button
                  type="button"
                  className="truncate font-bold text-primary hover:underline"
                  onClick={() => onOpenOrder(order.id)}
                >
                  {order.orderNumber}
                </button>
              </div>
              <div className="flex min-w-0 justify-start">
                <Label variant="dashboard" className="truncate opacity-100">
                  {order.customer.fullName}
                </Label>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-6">
                <Badge variant="destructive" size="xs">
                  <Clock className="mr-1 h-3 w-3" /> Overdue
                </Badge>
                <Label variant="dashboard" className="text-text-secondary">
                  Needs attention
                </Label>
              </div>
            </div>
          ))}

          {orders.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-secondary">
              No recent overdue orders found.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export const OVERDUE_ORDERS_QUERY = `/orders?status=${OrderStatus.OVERDUE}`;
