"use client";

import React, { useEffect, useState, useCallback } from "react";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatDate, formatPKR } from "@/lib/utils";
import { ItemStatus } from "@tbms/shared-types";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface AssignedWorkItem {
  id: string;
  order: {
    id: string;
    orderNumber: string;
    dueDate: string;
  };
  garmentTypeName: string;
  description: string;
  status: string;
  dueDate?: string;
  employeeRate: number;
}

export default function MyOrdersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AssignedWorkItem[]>([]);
  const [search, setSearch] = useState("");

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesApi.getAssignedItems();
      if (res.success) {
        const data = (res.data.data || []) as AssignedWorkItem[];
        
        // Client-side search for now as the employee endpoint might not support server-side search yet
        const filtered = data.filter((item) => 
          item.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          item.garmentTypeName.toLowerCase().includes(search.toLowerCase())
        );
        setItems(filtered);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load your assigned orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMyOrders]);

  const columns: ColumnDef<AssignedWorkItem>[] = [
    {
      header: "Order #",
      cell: (item) => <span className="font-bold text-primary">{item.order.orderNumber}</span>,
    },
    {
      header: "Garment Type",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm leading-tight">{item.garmentTypeName}</span>
          <Label variant="dashboard" className="mt-0.5">{item.description}</Label>
        </div>
      ),
    },
    {
      header: "Due Date",
      cell: (item) => {
        const date = formatDate(item.dueDate || item.order.dueDate);
        return <Label variant="dashboard">{date}</Label>;
      },
    },
    {
      header: "Status",
      cell: (item) => {
        const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
          [ItemStatus.PENDING]: { label: "Pending", variant: "outline" },
          [ItemStatus.IN_PROGRESS]: { label: "In Progress", variant: "default" },
          [ItemStatus.COMPLETED]: { label: "Completed", variant: "secondary" },
          [ItemStatus.CANCELLED]: { label: "Cancelled", variant: "destructive" },
        };
        const config = STATUS_MAP[item.status] || STATUS_MAP[ItemStatus.PENDING];
        return (
          <Badge variant={config.variant} size="xs">
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Rate",
      align: "right",
      cell: (item) => (
        <span className="text-sm font-semibold text-primary whitespace-nowrap">
          {formatPKR(item.employeeRate)}
        </span>
      ),
    },
  ];

  return (
    <div className=" space-y-6 max-w-9xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground text-center sm:text-left">My Work Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5 text-center sm:text-left">Review and manage your assigned tailoring tasks.</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
        {/* Left Group: Search */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[240px] max-w-sm">
          <Label variant="dashboard" className="ml-1">
            Search My Orders
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              variant="premium"
              placeholder="Order #, garment type..."
              className="pl-9"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right Group: Clear Button */}
        <div className="flex items-end">
          <Button
            variant="muted"
            size="sm"
            className="h-10 w-full lg:w-auto px-4"
            onClick={() => setSearch("")}
          >
            Clear Search
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        itemLabel="items"
        emptyMessage="You don't have any orders assigned to you at the moment."
      />
    </div>
  );
}
