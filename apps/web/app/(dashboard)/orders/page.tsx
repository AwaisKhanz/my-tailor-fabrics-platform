"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Printer,
  History,
  Search,
  Plus
} from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { Order, OrderStatus } from "@/types/orders";
import { formatPKR } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStatus as SharedOrderStatus, BadgeVariant } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState("30");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let from: string | undefined;
      const now = new Date();
      
      if (dateRange === "7") {
        from = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (dateRange === "30") {
        from = new Date(now.setDate(now.getDate() - 30)).toISOString();
      } else if (dateRange === "90") {
        from = new Date(now.setDate(now.getDate() - 90)).toISOString();
      }

      const response = await ordersApi.getOrders({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search || undefined,
        from,
        page,
        limit: PAGE_SIZE,
      });
      if (response.success) {
        setOrders(response.data.data);
        setTotal(response.data.total);
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, dateRange, page, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const columns: ColumnDef<Order>[] = [
    {
      header: "Order ID",
      cell: (order) => (
        <span
          className="font-bold text-primary text-sm cursor-pointer hover:underline"
          onClick={() => router.push(`/orders/${order.id}`)}
        >
          {order.orderNumber}
        </span>
      ),
    },
    {
      header: "Customer",
      cell: (order) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm leading-tight">{order.customer.fullName}</span>
          <Label variant="dashboard" className="mt-0.5">{order.customer.phone}</Label>
        </div>
      ),
    },
    {
      header: "Order Date",
      cell: (order) => {
        const date = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return <span className="text-sm text-muted-foreground whitespace-nowrap">{date}</span>;
      },
    },
    {
      header: "Due Date",
      cell: (order) => {
        const date = new Date(order.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const isOverdue = order.status === SharedOrderStatus.OVERDUE;
        return (
          <span className={`text-sm font-medium ${isOverdue ? "text-destructive font-bold" : "text-muted-foreground"} whitespace-nowrap`}>
            {date}
          </span>
        );
      },
    },
    {
      header: "Total Amount",
      cell: (order) => (
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {formatPKR(order.totalAmount)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (order) => {
        const sc = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.NEW;
        return (
          <Badge 
            variant={sc.variant as BadgeVariant} 
            size="xs"
            className="px-2"
          >
            {sc.label}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (order) => {
        const isReady = order.status === "READY";
        const isDelivered = order.status === SharedOrderStatus.DELIVERED || order.status === SharedOrderStatus.COMPLETED;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => router.push(`/orders/${order.id}`)}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>

            {!isDelivered && (
              <button
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => router.push(`/orders/new?edit=${order.id}`)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {isReady && (
              <button
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Print Receipt"
              >
                <Printer className="h-4 w-4" />
              </button>
            )}

            {isDelivered && (
              <button
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="View History"
              >
                <History className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your customer orders and production workflow.</p>
        </div>
        <Button variant="premium" size="lg" onClick={() => router.push('/orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      {/* Orders Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Integrated Header */}
        <div className="px-6 py-5 border-b border-border/50 bg-muted/5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg text-foreground">Order Book</h2>
                <Badge variant="secondary" size="xs" >
                  {total} results
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative group flex-1 min-w-[280px]">
                <Input
                  placeholder="Search Order #, customer..."
                  variant="premium"
                  className="pl-9 h-10 bg-background"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Status Filter */}
              <div className="w-36">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as OrderStatus | "ALL"); setPage(1); }}>
                  <SelectTrigger className="h-10 text-[11px] font-bold border-border bg-background shadow-none">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs font-medium">All Statuses</SelectItem>
                    {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-xs font-medium">{ORDER_STATUS_CONFIG[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="w-36">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-10 text-[11px] font-bold border-border bg-background shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7" className="text-xs font-medium">Last 7 Days</SelectItem>
                    <SelectItem value="30" className="text-xs font-medium">Last 30 Days</SelectItem>
                    <SelectItem value="90" className="text-xs font-medium">Last 3 Months</SelectItem>
                    <SelectItem value="all" className="text-xs font-medium">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setDateRange("30");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="p-0">
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            page={page}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="orders"
            emptyMessage="No orders found matching your criteria."
            onRowClick={(order) => router.push(`/orders/${order.id}`)}
          />
        </div>
      </div>

    </div>)
}
