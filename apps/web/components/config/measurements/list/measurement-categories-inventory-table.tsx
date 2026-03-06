import { useMemo } from "react";
import { Edit2, Eye, RotateCcw, Trash2 } from "lucide-react";
import { MEASUREMENT_STATUS_BADGE, MEASUREMENT_STATUS_LABELS } from "@tbms/shared-constants";
import { type MeasurementCategory } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";

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
        header: "Category Name",
        cell: (category) => (
          category.deletedAt ? (
            <span className="font-semibold text-muted-foreground">
              {category.name}
            </span>
          ) : (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onView(category);
              }}
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              {category.name}
            </button>
          )
        ),
      },
      {
        header: "Fields",
        cell: (category) => <Badge variant="info" size="xs">{category.fields?.length || 0} Fields</Badge>,
      },
      {
        header: "Status",
        cell: (category) => (
          <Badge
            variant={
              category.deletedAt
                ? "outline"
                : category.isActive
                  ? MEASUREMENT_STATUS_BADGE.ACTIVE
                  : MEASUREMENT_STATUS_BADGE.HIDDEN
            }
            size="xs"
          >
            {category.deletedAt
              ? "Archived"
              : category.isActive
                ? MEASUREMENT_STATUS_LABELS.ACTIVE
                : MEASUREMENT_STATUS_LABELS.HIDDEN}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (category) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={Boolean(category.deletedAt)}
              onClick={(event) => {
                event.stopPropagation();
                onView(category);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canManageMeasurements ? (
              <>
                {category.deletedAt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={restoringId === category.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRestore(category);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoringId === category.id ? "Restoring..." : "Restore"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(category);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(category);
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

  return (
    <DataTable
      columns={columns}
      data={categories}
      loading={loading}
      emptyMessage="No categories found."
      itemLabel="categories"
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      chrome="flat"
      onRowClick={(category) => {
        if (!category.deletedAt) {
          onView(category);
        }
      }}
    />
  );
}
