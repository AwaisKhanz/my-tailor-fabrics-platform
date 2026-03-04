import { useMemo } from "react";
import Link from "next/link";
import { Clock, Edit2, Shirt, Trash2 } from "lucide-react";
import { GARMENT_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";
import { type GarmentTypeWithWorkflow } from "@/hooks/use-garment-types-page";

interface GarmentTypesInventoryTableProps {
  garmentTypes: GarmentTypeWithWorkflow[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpen: (type: GarmentTypeWithWorkflow) => void;
  onEdit: (type: GarmentTypeWithWorkflow) => void;
  onOpenHistory: (type: GarmentTypeWithWorkflow) => void;
  onOpenWorkflow: (type: GarmentTypeWithWorkflow) => void;
  onDelete: (type: GarmentTypeWithWorkflow) => void;
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
  canManageGarments = true,
}: GarmentTypesInventoryTableProps) {
  const columns = useMemo<ColumnDef<GarmentTypeWithWorkflow>[]>(
    () => [
      {
        header: "Garment Name",
        cell: (item) => (
          <div className="group/row flex items-center gap-4">
            <InfoTile
              tone="surface"
              padding="none"
              interaction="interactivePrimary"
              className="h-10 w-10 shrink-0 items-center justify-center"
            >
              <Shirt className="h-5 w-5 text-text-secondary transition-colors group-hover/row:text-primary" />
            </InfoTile>
            <Link
              href={`/settings/garments/${item.id}`}
              className="group/link flex flex-col transition-opacity hover:opacity-80"
            >
              <span className="text-sm font-bold leading-tight text-text-primary transition-colors group-hover/link:text-primary">
                {item.name}
              </span>
              <Label variant="dashboard" className="mt-0.5">
                ID: GT-{item.id.slice(-4).toUpperCase()}
              </Label>
            </Link>
          </div>
        ),
      },
      {
        header: "Customer Price",
        cell: (item) => <span className="text-sm font-bold text-text-primary">{formatPKR(item.customerPrice)}</span>,
      },
      {
        header: "Employee Rate",
        cell: (item) => <span className="text-sm font-bold text-text-primary">{formatPKR(item.employeeRate)}</span>,
      },
      {
        header: "Status",
        cell: (item) => (
          <Badge variant={item.isActive ? "success" : "outline"} size="xs">
            {item.isActive ? GARMENT_STATUS_LABELS.ACTIVE : GARMENT_STATUS_LABELS.INACTIVE}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (item) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="tableIcon"
              size="iconSm"
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
                <Button
                  variant="tableIcon"
                  size="iconSm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="tableIcon"
                  size="iconSm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenWorkflow(item);
                  }}
                  title="Configure Production Workflow"
                >
                  <Shirt className="h-4 w-4" />
                </Button>

                <Button
                  variant="tableDanger"
                  size="iconSm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(item);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [canManageGarments, onDelete, onEdit, onOpenHistory, onOpenWorkflow],
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
