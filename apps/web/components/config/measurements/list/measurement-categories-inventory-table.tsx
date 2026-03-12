import { useMemo } from "react";
import { Edit2, Eye, RotateCcw, Trash2 } from "lucide-react";
import { MEASUREMENT_STATUS_BADGE, MEASUREMENT_STATUS_LABELS } from "@tbms/shared-constants";
import { type MeasurementCategory } from "@tbms/shared-types";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { resolveUpdater } from "@/lib/tanstack";

interface MeasurementCategoriesInventoryTableProps {
  categories: MeasurementCategory[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (category: MeasurementCategory) => void;
  onEdit: (category: MeasurementCategory) => void;
  onDelete: (category: MeasurementCategory) => void;
  onRestore: (category: MeasurementCategory) => void;
  restoringId?: string | null;
  canManageMeasurements?: boolean;
}

export function MeasurementCategoriesInventoryTable({
  categories,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onRestore,
  restoringId = null,
  canManageMeasurements = true,
}: MeasurementCategoriesInventoryTableProps) {
  const columns = useMemo<ColumnDef<MeasurementCategory>[]>(
    () => [
      {
        id: "name",
        header: "Category Name",
        cell: ({ row }) => (
          row.original.deletedAt ? (
            <span className="font-semibold text-muted-foreground">
              {row.original.name}
            </span>
          ) : (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onView(row.original);
              }}
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              {row.original.name}
            </button>
          )
        ),
      },
      {
        id: "fields",
        header: "Fields",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.fields?.length || 0} Fields</Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.deletedAt
                ? "outline"
                : row.original.isActive
                  ? MEASUREMENT_STATUS_BADGE.ACTIVE
                  : MEASUREMENT_STATUS_BADGE.HIDDEN
            }

          >
            {row.original.deletedAt
              ? "Archived"
              : row.original.isActive
                ? MEASUREMENT_STATUS_LABELS.ACTIVE
                : MEASUREMENT_STATUS_LABELS.HIDDEN}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={Boolean(row.original.deletedAt)}
              onClick={(event) => {
                event.stopPropagation();
                onView(row.original);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canManageMeasurements ? (
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
    [canManageMeasurements, onDelete, onEdit, onRestore, onView, restoringId],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const onPaginationChange = useMemo(
    () =>
      (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
        const next = resolveUpdater(updater, pagination);
        onPageChange(next.pageIndex + 1);
      },
    [onPageChange, pagination],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useMemo(
    () =>
      (updater: SortingState | ((old: SortingState) => SortingState)) => {
        void updater;
      },
    [],
  );

  return (
    <DataTableTanstack
      columns={columns}
      data={categories}
      loading={loading}
      emptyMessage="No categories found."
      itemLabel="categories"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={Math.max(1, Math.ceil(total / pageSize))}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={onSortingChange}
      chrome="flat"
      onRowClick={(row) => {
        if (!row.original.deletedAt) {
          onView(row.original);
        }
      }}
    />
  );
}
