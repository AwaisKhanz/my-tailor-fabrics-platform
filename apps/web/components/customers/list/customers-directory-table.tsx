import { useMemo } from "react";
import { Eye, Pencil } from "lucide-react";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABELS,
} from "@tbms/shared-constants";
import { type Customer } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { FieldLabel } from "@/components/ui/field";
import { formatPKR } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-primary/10 text-primary",
  "bg-primary/10 text-primary",
  "bg-secondary text-secondary-foreground",
  "bg-primary/10 text-primary",
  "bg-destructive/10 text-destructive",
  "bg-primary/10 text-primary",
  "bg-muted text-foreground",
  "bg-muted text-muted-foreground",
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
  canEditCustomer?: boolean;
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
  canEditCustomer = true,
}: CustomersDirectoryTableProps) {
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        header: "Size Number",
        cell: (customer) => (
          <span
            className="cursor-pointer text-sm font-semibold text-primary hover:underline"
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
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
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
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {customer.phone}
            </span>
            {customer.whatsapp ? (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary/50" />
                <FieldLabel tone="primary">WhatsApp Connected</FieldLabel>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
                <FieldLabel>No WhatsApp</FieldLabel>
              </div>
            )}
          </div>
        ),
      },
      {
        header: "City",
        cell: (customer) => <FieldLabel>{customer.city || "—"}</FieldLabel>,
      },
      {
        header: "Lifetime Value",
        cell: (customer) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatPKR(customer.lifetimeValue)}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (customer) => (
          <Badge
            variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"}
            size="xs"
          >
            {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (customer) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onView(customer);
              }}
              title="View"
              aria-label={`View ${customer.fullName}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canEditCustomer ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(customer);
                }}
                title="Edit"
                aria-label={`Edit ${customer.fullName}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canEditCustomer, onEdit, onView],
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
      chrome="flat"
      onRowClick={onView}
    />
  );
}
