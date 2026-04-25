import { useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import { Clock, Edit2, RotateCcw, Shirt, Trash2 } from "lucide-react";
import { type GarmentType } from "@tbms/shared-types";
import { GARMENT_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { buildGarmentSettingsDetailRoute } from "@/lib/settings-routes";
import { resolveUpdater } from "@/lib/tanstack";
import { formatPKR } from "@/lib/utils";

interface GarmentTypesInventoryTableProps {
  garmentTypes: GarmentType[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpen: (type: GarmentType) => void;
  onEdit: (type: GarmentType) => void;
  onOpenHistory: (type: GarmentType) => void;
  onOpenWorkflow: (type: GarmentType) => void;
  onDelete: (type: GarmentType) => void;
  onRestore: (type: GarmentType) => void;
  restoringId?: string | null;
  canManageGarments?: boolean;
}

export function GarmentTypesInventoryTable({
  garmentTypes,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onOpen,
  onEdit,
  onOpenHistory,
  onOpenWorkflow,
  onDelete,
  onRestore,
  restoringId = null,
  canManageGarments = true,
}: GarmentTypesInventoryTableProps) {
  const columns = useMemo<ColumnDef<GarmentType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Garment Name",
        cell: ({ row }) => (
          <div className="group/row flex items-center gap-4">
            <Link
              href={buildGarmentSettingsDetailRoute(row.original.id)}
              onClick={(event) => {
                if (row.original.deletedAt) {
                  event.preventDefault();
                }
              }}
              className="group/link flex flex-col transition-opacity hover:opacity-80"
            >
              <span className="text-sm font-bold leading-tight text-foreground transition-colors group-hover/link:text-primary">
                {row.original.name}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                ID: GT-{row.original.id.slice(-4).toUpperCase()}
              </span>
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "customerPrice",
        header: "Customer Price",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-foreground">
            {formatPKR(row.original.customerPrice)}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.deletedAt
                ? "outline"
                : row.original.isActive
                  ? "default"
                  : "outline"
            }

          >
            {row.original.deletedAt
              ? "Archived"
              : row.original.isActive
                ? GARMENT_STATUS_LABELS.ACTIVE
                : GARMENT_STATUS_LABELS.INACTIVE}
          </Badge>
        ),
      },
      {
        id: "setup",
        header: "Setup",
        cell: ({ row }) => {
          const measurementCount = row.original.measurementCategories?.length ?? 0;
          const workflowCount =
            row.original.workflowSteps?.filter((step) => step.isActive).length ?? 0;

          return (
            <div className="space-y-1 text-sm">
              <div className="font-medium text-foreground">
                {measurementCount} measurement form
                {measurementCount === 1 ? "" : "s"}
              </div>
              <div className="text-xs text-muted-foreground">
                {workflowCount} active workflow step
                {workflowCount === 1 ? "" : "s"}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onOpenHistory(row.original);
              }}
              title="View Price History"
            >
              <Clock className="h-4 w-4" />
            </Button>

            {canManageGarments ? (
              <>
                {row.original.deletedAt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={restoringId === row.original.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRestore(row.original);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoringId === row.original.id ? "Restoring..." : "Restore"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(row.original);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenWorkflow(row.original);
                      }}
                      title="Configure Production Workflow"
                    >
                      <Shirt className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(row.original);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [
      canManageGarments,
      onDelete,
      onEdit,
      onOpenHistory,
      onOpenWorkflow,
      onRestore,
      restoringId,
    ],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const onPaginationChange = useMemo<OnChangeFn<PaginationState>>(
    () => (updater) => {
      const next =
        resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useMemo<OnChangeFn<SortingState>>(
    () => () => {
      return;
    },
    [],
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={garmentTypes}
      loading={loading}
      emptyMessage="No garment types found."
      itemLabel="types"
      chrome="flat"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={onSortingChange}
      onRowClick={(row) => onOpen(row.original)}
    />
  );
}
