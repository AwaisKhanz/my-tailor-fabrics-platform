import { useMemo } from "react";
import Link from "next/link";
import { Clock, Edit2, RotateCcw, Shirt, Trash2 } from "lucide-react";
import { type GarmentType } from "@tbms/shared-types";
import { GARMENT_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
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
        header: "Garment Name",
        cell: (item) => (
          <div className="group/row flex items-center gap-4">
            <Link
              href={`/settings/garments/${item.id}`}
              onClick={(event) => {
                if (item.deletedAt) {
                  event.preventDefault();
                }
              }}
              className="group/link flex flex-col transition-opacity hover:opacity-80"
            >
              <span className="text-sm font-bold leading-tight text-foreground transition-colors group-hover/link:text-primary">
                {item.name}
              </span>
              <Label className="text-sm font-bold uppercase  text-muted-foreground mt-0.5">
                ID: GT-{item.id.slice(-4).toUpperCase()}
              </Label>
            </Link>
          </div>
        ),
      },
      {
        header: "Customer Price",
        cell: (item) => (
          <span className="text-sm font-bold text-foreground">
            {formatPKR(item.customerPrice)}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (item) => (
          <Badge
            variant={
              item.deletedAt ? "outline" : item.isActive ? "success" : "outline"
            }
            size="xs"
          >
            {item.deletedAt
              ? "Archived"
              : item.isActive
                ? GARMENT_STATUS_LABELS.ACTIVE
                : GARMENT_STATUS_LABELS.INACTIVE}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (item) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onOpenHistory(item);
              }}
              title="View Price History"
            >
              <Clock className="h-4 w-4" />
            </Button>

            {canManageGarments ? (
              <>
                {item.deletedAt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={restoringId === item.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRestore(item);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoringId === item.id ? "Restoring..." : "Restore"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenWorkflow(item);
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
                        onDelete(item);
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

  return (
    <DataTable
      columns={columns}
      data={garmentTypes}
      loading={loading}
      emptyMessage="No garment types found."
      itemLabel="types"
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      onRowClick={onOpen}
      chrome="flat"
    />
  );
}
