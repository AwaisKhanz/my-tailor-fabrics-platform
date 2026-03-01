"use client";

import React, { useEffect, useState, useCallback } from "react";
import { customerApi } from "@/lib/api/customers";
import { Customer, CustomerStatus } from "@tbms/shared-types";
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_BADGE } from "@tbms/shared-constants";
import {
  Search,
  Eye,
  Pencil,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomerDialog } from "./CustomerDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
  "bg-info/20 text-info",
  "bg-destructive/10 text-destructive",
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type StatusTab = CustomerStatus | "ALL";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: CustomerStatus.ACTIVE, label: CUSTOMER_STATUS_LABELS[CustomerStatus.ACTIVE] },
  { key: CustomerStatus.INACTIVE, label: CUSTOMER_STATUS_LABELS[CustomerStatus.INACTIVE] },
  { key: CustomerStatus.BLACKLISTED, label: CUSTOMER_STATUS_LABELS[CustomerStatus.BLACKLISTED] },
];

export function CustomerTable() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<StatusTab>(CustomerStatus.ACTIVE);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomers(page, limit, search);
      let fetched = response.data;

      if (statusTab !== "ALL") {
        fetched = fetched.filter((c) => c.status === statusTab);
      }

      setCustomers(fetched);
      setTotal(response.total);
    } catch {
      console.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Customer>[] = [
    {
      header: "Size Number",
      cell: (customer) => (
        <span
          className="font-bold text-sm text-primary cursor-pointer hover:underline"
          onClick={() => router.push(`/customers/${customer.id}`)}
        >
          {customer.sizeNumber}
        </span>
      ),
    },
    {
      header: "Full Name",
      cell: (customer) => {
        const initials = getInitials(customer.fullName);
        const avatarCls = avatarColor(customer.id);
        return (
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarCls}`}>
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm leading-tight">
                {customer.fullName}
              </span>
              {customer.isVip && (
                <span className="mt-0.5 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 uppercase tracking-wider w-fit">
                  VIP Customer
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Contact Info",
      cell: (customer) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-foreground font-medium">{customer.phone}</span>
          {((customer as { whatsapp?: boolean }).whatsapp) ? (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success/50 shrink-0" />
              <span className="text-xs text-muted-foreground">WhatsApp Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/50 shrink-0" />
              <span className="text-xs text-muted-foreground">No WhatsApp</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "City",
      cell: (customer) => (
        <span className="text-sm text-muted-foreground">
          {customer.city || "—"}
        </span>
      ),
    },
    {
      header: "Lifetime Value",
      cell: (customer) => (
        <span className="font-bold text-sm text-foreground">
          Rs. {(customer.lifetimeValue / 100).toLocaleString("en-PK")}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (customer: Customer) => {
        const variant = CUSTOMER_STATUS_BADGE[customer.status] ?? "outline";
        return (
          <Badge variant={variant} className="uppercase tracking-wider">
            {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (customer) => (
        <div className="flex items-center justify-end gap-1">
          <button
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => router.push(`/customers/${customer.id}`)}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleEdit(customer)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className=" space-y-5 max-w-9xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Customer Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your tailoring clients and their measurement history.</p>
        </div>
        <Button
          onClick={handleAdd}
          variant="premium"
          size="xl"
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add New Customer
        </Button>
      </div>

      {/* Customer Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Integrated Header */}
        <div className="px-6 py-5 border-b border-border/50 bg-muted/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <h2 className="font-bold text-lg text-foreground">Client Directory</h2>
               <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-md ring-1 ring-border">
                  {total} results
               </span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative group w-full md:w-72">
                 <Input 
                   placeholder="Name, phone, size..." 
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
              <div className="w-full md:w-44">
                <Select
                  value={statusTab}
                  onValueChange={(v) => {
                    setStatusTab(v as StatusTab);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-bold border-border bg-background shadow-none">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_TABS.map((tab) => (
                      <SelectItem key={tab.key} value={tab.key} className="text-xs font-medium">
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setStatusTab(CustomerStatus.ACTIVE);
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="p-0"> {/* DataTable handles its own padding or we can use p-6 if needed, but DataTable usually handles it */}
          <DataTable
            columns={columns}
            data={customers}
            loading={loading}
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
            itemLabel="customers"
            emptyMessage="No customers found matching your criteria."
          />
        </div>
      </div>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSuccess={fetchData}
      />
    </div>
  );
}
