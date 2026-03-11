"use client";

import * as React from "react";
import { ChevronRight, Columns3, Search } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tbms/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@tbms/ui/components/tabs";
import { formatPKR } from "@/lib/utils";

const visibleColumnsConfig = {
  customer: true,
  dueDate: true,
  total: true,
  balance: true,
  status: true,
} as const;

type VisibleColumns = typeof visibleColumnsConfig;

type FilterTab = "all" | "overdue" | "in-progress" | "done";

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

function isOverdue(order: Order) {
  return (
    order.balanceDue > 0 &&
    new Date(order.dueDate).getTime() < Date.now() &&
    !order.status.toLowerCase().includes("deliver")
  );
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
  const [tab, setTab] = React.useState<FilterTab>("all");
  const [query, setQuery] = React.useState("");
  const [visibleColumns, setVisibleColumns] =
    React.useState<VisibleColumns>(visibleColumnsConfig);

  const filteredOrders = React.useMemo(() => {
    const base = orders.filter((order) => {
      const haystack =
        `${order.orderNumber} ${order.customer?.fullName ?? ""}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

    if (tab === "overdue") {
      return base.filter(isOverdue);
    }

    if (tab === "done") {
      return base.filter((order) =>
        order.status.toLowerCase().includes("deliver"),
      );
    }

    if (tab === "in-progress") {
      return base.filter(
        (order) => !order.status.toLowerCase().includes("deliver"),
      );
    }

    return base;
  }, [orders, query, tab]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Track latest orders, dues, and delivery progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order or customer"
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  <Columns3 className="size-4" />
                  Columns
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {(
                    Object.keys(visibleColumns) as Array<keyof VisibleColumns>
                  ).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={visibleColumns[key]}
                      onCheckedChange={(checked) => {
                        setVisibleColumns((current) => ({
                          ...current,
                          [key]: checked,
                        }));
                      }}
                      className="capitalize"
                    >
                      {key}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={tab}
                onValueChange={(value) => setTab((value ?? "all") as FilterTab)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="done">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            value={tab}
            onValueChange={(value) => setTab((value ?? "all") as FilterTab)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="done">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  {visibleColumns.customer ? (
                    <TableHead>Customer</TableHead>
                  ) : null}
                  {visibleColumns.dueDate ? (
                    <TableHead>Due Date</TableHead>
                  ) : null}
                  {visibleColumns.total ? (
                    <TableHead className="text-right">Total</TableHead>
                  ) : null}
                  {visibleColumns.balance ? (
                    <TableHead className="text-right">Balance</TableHead>
                  ) : null}
                  {visibleColumns.status ? <TableHead>Status</TableHead> : null}
                  <TableHead className="w-[72px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
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
                      {visibleColumns.customer ? (
                        <TableCell>{order.customer.fullName ?? "-"}</TableCell>
                      ) : null}
                      {visibleColumns.dueDate ? (
                        <TableCell>{formatDate(order.dueDate)}</TableCell>
                      ) : null}
                      {visibleColumns.total ? (
                        <TableCell className="text-right tabular-nums">
                          {formatPKR(order.totalAmount)}
                        </TableCell>
                      ) : null}
                      {visibleColumns.balance ? (
                        <TableCell className="text-right tabular-nums">
                          {formatPKR(order.balanceDue)}
                        </TableCell>
                      ) : null}
                      {visibleColumns.status ? (
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => onOpenOrder(order.id)}
                        >
                          <ChevronRight className="size-4" />
                          <span className="sr-only">Open order</span>
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
    </div>
  );
}
