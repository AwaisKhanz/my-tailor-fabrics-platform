import { useMemo } from "react";
import { Eye, Pencil } from "lucide-react";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { type Customer } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";

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
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index++) {
    hash += id.charCodeAt(index);
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface CustomersDirectoryTableProps {
  customers: Customer[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}

export function CustomersDirectoryTable({
  customers,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onView,
  onEdit,
}: CustomersDirectoryTableProps) {
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        header: "Size Number",
        cell: (customer) => (
          <span
            className="cursor-pointer text-sm font-bold text-primary hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onView(customer);
            }}
          >
            {customer.sizeNumber}
          </span>
        ),
      },
      {
        header: "Full Name",
        cell: (customer) => {
          const initials = getInitials(customer.fullName);
          const avatarClassName = avatarColor(customer.id);
          return (
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
              >
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight text-foreground">
                  {customer.fullName}
                </span>
                {customer.isVip ? (
                  <Badge variant="warning" size="xs">
                    VIP Customer
                  </Badge>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        header: "Contact Info",
        cell: (customer) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{customer.phone}</span>
            {customer.whatsapp ? (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-success/50" />
                <Label variant="dashboard" className="text-success opacity-100">
                  WhatsApp Connected
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
                <Label variant="dashboard">No WhatsApp</Label>
              </div>
            )}
          </div>
        ),
      },
      {
        header: "City",
        cell: (customer) => <Label variant="dashboard">{customer.city || "—"}</Label>,
      },
      {
        header: "Lifetime Value",
        cell: (customer) => (
          <span className="text-sm font-bold text-foreground">{formatPKR(customer.lifetimeValue)}</span>
        ),
      },
      {
        header: "Status",
        cell: (customer) => (
          <Badge variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"} size="xs">
            {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (customer) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onView(customer);
              }}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(customer);
              }}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onView],
  );

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      itemLabel="customers"
      emptyMessage="No customers found matching your criteria."
      onRowClick={onView}
    />
  );
}
