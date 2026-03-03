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
    <Card className="border-border shadow-sm lg:col-span-2">
      <CardHeader variant="rowSection" className="items-center">
        <CardTitle variant="dashboard">Recent Overdue Orders</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewOverdueOrders}>
          View all
        </Button>
      </CardHeader>
      <CardContent spacing="section" className="overflow-hidden rounded-b-xl p-0">
        <div className="divide-y border-t border-border">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="w-1/3">
                <button
                  type="button"
                  className="font-bold text-primary hover:underline"
                  onClick={() => onOpenOrder(order.id)}
                >
                  {order.orderNumber}
                </button>
              </div>
              <div className="flex w-1/3 justify-start">
                <Label variant="dashboard" className="opacity-100">
                  {order.customer.fullName}
                </Label>
              </div>
              <div className="flex w-1/3 items-center justify-end gap-6">
                <Badge variant="destructive" size="xs">
                  <Clock className="mr-1 h-3 w-3" /> Overdue
                </Badge>
                <Label variant="dashboard" className="cursor-pointer text-primary hover:underline">
                  Notify
                </Label>
              </div>
            </div>
          ))}

          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No recent overdue orders found.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export const OVERDUE_ORDERS_QUERY = `/orders?status=${OrderStatus.OVERDUE}`;
