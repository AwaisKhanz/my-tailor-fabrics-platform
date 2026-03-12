import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABELS,
} from "@tbms/shared-constants";
import { type Customer } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";

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
        accessorKey: "sizeNumber",
        header: "Size Number",
        cell: ({ row }) => (
          <span
            className="cursor-pointer text-sm font-semibold text-primary hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onView(row.original);
            }}
          >
            {row.original.sizeNumber}
          </span>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        cell: ({ row }) => {
          const initials = getInitials(row.original.fullName);
          const avatarClassName = avatarColor(row.original.id);
          return (
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
              >
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight text-foreground">
                  {row.original.fullName}
                </span>
                {row.original.isVip ? (
                  <Badge variant="secondary">
                    VIP Customer
                  </Badge>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: "contactInfo",
        enableSorting: false,
        header: "Contact Info",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {row.original.phone}
            </span>
            {row.original.whatsapp ? (
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
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => <FieldLabel>{row.original.city || "—"}</FieldLabel>,
      },
      {
        accessorKey: "lifetimeValue",
        header: "Lifetime Value",
        cell: ({ row }) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatPKR(row.original.lifetimeValue)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={CUSTOMER_STATUS_BADGE[row.original.status] ?? "outline"}

          >
            {CUSTOMER_STATUS_LABELS[row.original.status] || row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onView(row.original);
              }}
              title="View"
              aria-label={`View ${row.original.fullName}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canEditCustomer ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(row.original);
                }}
                title="Edit"
                aria-label={`Edit ${row.original.fullName}`}
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

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next =
        resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );

  const sorting = useMemo<SortingState>(() => [], []);
  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(() => {
    return;
  }, []);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={customers}
      loading={loading}
      chrome="flat"
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={handleSortingChange}
      itemLabel="customers"
      emptyMessage="No customers found matching your criteria."
      onRowClick={(row) => onView(row.original)}
    />
  );
}
