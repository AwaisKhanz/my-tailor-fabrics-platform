"use client";

import { ChevronRight } from "lucide-react";
import type { Order } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tbms/ui/components/table";
import { formatPKR } from "@/lib/utils";

function getStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("cancel")) {
    return "destructive" as const;
  }

  if (normalized.includes("deliver") || normalized.includes("complete")) {
    return "default" as const;
  }

  if (normalized.includes("progress") || normalized.includes("tailor")) {
    return "secondary" as const;
  }

  if (normalized.includes("hold")) {
    return "secondary" as const;
  }

  return "outline" as const;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardDataTable({
  orders,
  onOpenOrder,
}: {
  orders: Order[];
  onOpenOrder: (orderId: string) => void;
}) {
  const recentOrders = [...orders]
    .sort(
      (left, right) =>
        new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
    )
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          Latest orders snapshot. Open any order for full details.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[72px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No recent orders.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto px-0 text-left"
                        onClick={() => onOpenOrder(order.id)}
                      >
                        {order.orderNumber}
                      </Button>
                    </TableCell>
                    <TableCell>{order.customer.fullName ?? "-"}</TableCell>
                    <TableCell>{formatDate(order.dueDate)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPKR(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPKR(order.balanceDue)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onOpenOrder(order.id)}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
