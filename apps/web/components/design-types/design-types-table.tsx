import { useMemo } from "react";
import { Edit2, GitBranch, RotateCcw, Search, Trash2 } from "lucide-react";
import { type Branch, type DesignType, type GarmentType } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSearch, TableSurface, TableToolbar } from "@/components/ui/table-layout";
import { formatPKR } from "@/lib/utils";

interface DesignTypesTableProps {
  loading: boolean;
  designTypes: DesignType[];
  total: number;
  page: number;
  pageSize: number;
  garmentTypes: GarmentType[];
  branches: Branch[];
  search: string;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onEdit: (designType: DesignType) => void;
  onDelete: (designType: DesignType) => void;
  canManageDesignTypes?: boolean;
}

export function DesignTypesTable({
  loading,
  designTypes,
  total,
  page,
  pageSize,
  garmentTypes,
  branches,
  search,
  hasActiveFilters,
  onPageChange,
  onSearchChange,
  onResetFilters,
  onEdit,
  onDelete,
  canManageDesignTypes = true,
}: DesignTypesTableProps) {
  const garmentNameById = useMemo(
    () => new Map(garmentTypes.map((garment) => [garment.id, garment.name])),
    [garmentTypes],
  );
  const branchById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch])),
    [branches],
  );

  const columns = useMemo<ColumnDef<DesignType>[]>(
    () => [
      {
        header: "Name",
        cell: (designType) => <div className="font-bold text-foreground">{designType.name}</div>,
      },
      {
        header: "Application",
        cell: (designType) =>
          designType.garmentTypeId ? (
            <span className="text-xs font-medium">
              {garmentNameById.get(designType.garmentTypeId) || "Garment"}
            </span>
          ) : (
            <Badge variant="default" size="xs">
              Universal
            </Badge>
          ),
      },
      {
        header: "Branch",
        cell: (designType) =>
          designType.branchId ? (
            <Badge variant="outline" size="xs" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {branchById.get(designType.branchId)?.code || "Branch"}
            </Badge>
          ) : (
            <Badge variant="info" size="xs">
              Global
            </Badge>
          ),
      },
      {
        header: "Customer Price",
        align: "right",
        cell: (designType) => <span className="font-bold">{formatPKR(designType.defaultPrice)}</span>,
      },
      {
        header: "Worker Rate",
        align: "right",
        cell: (designType) => (
          <span className="font-bold text-primary">{formatPKR(designType.defaultRate)}</span>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (designType) => (
          <div className="flex justify-end gap-2">
            {canManageDesignTypes ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(designType);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(designType);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">Read only</span>
            )}
          </div>
        ),
      },
    ],
    [branchById, canManageDesignTypes, garmentNameById, onDelete, onEdit],
  );

  return (
    <TableSurface>
      <TableToolbar
        title="Design Type Directory"
        total={total}
        totalLabel="types"
        activeFilterCount={hasActiveFilters ? 1 : 0}
        controls={
          <>
            <TableSearch
              icon={<Search className="h-4 w-4" />}
              placeholder="Search design or garment..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="md:ml-auto"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={designTypes}
        loading={loading}
        itemLabel="design types"
        emptyMessage="No design types have been defined yet."
        chrome="flat"
        page={page}
        total={total}
        limit={pageSize}
        onPageChange={onPageChange}
        onRowClick={canManageDesignTypes ? onEdit : undefined}
      />
    </TableSurface>
  );
}
