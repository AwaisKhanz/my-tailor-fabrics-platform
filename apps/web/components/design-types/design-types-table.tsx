import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Edit2, GitBranch, RotateCcw, Search, Trash2 } from "lucide-react";
import { type Branch, type DesignType, type GarmentType } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { TableSearch, TableSurface, TableToolbar } from "@tbms/ui/components/table-layout";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";

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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-bold text-foreground">{row.original.name}</div>
        ),
      },
      {
        id: "application",
        enableSorting: false,
        header: "Application",
        cell: ({ row }) =>
          row.original.garmentTypeId ? (
            <span className="text-xs font-medium">
              {garmentNameById.get(row.original.garmentTypeId) || "Garment"}
            </span>
          ) : (
            <Badge variant="default">
              Universal
            </Badge>
          ),
      },
      {
        id: "branch",
        enableSorting: false,
        header: "Branch",
        cell: ({ row }) =>
          row.original.branchId ? (
            <Badge variant="outline" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {branchById.get(row.original.branchId)?.code || "Branch"}
            </Badge>
          ) : (
            <Badge variant="secondary">
              Global
            </Badge>
          ),
      },
      {
        accessorKey: "defaultPrice",
        header: "Customer Price",
        cell: ({ row }) => <span className="font-bold">{formatPKR(row.original.defaultPrice)}</span>,
      },
      {
        accessorKey: "defaultRate",
        header: "Worker Rate",
        cell: ({ row }) => (
          <span className="font-bold text-primary">{formatPKR(row.original.defaultRate)}</span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {canManageDesignTypes ? (
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
            ) : (
              <span className="text-xs font-medium text-muted-foreground">Read only</span>
            )}
          </div>
        ),
      },
    ],
    [branchById, canManageDesignTypes, garmentNameById, onDelete, onEdit],
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
      <DataTableTanstack
        columns={columns}
        data={designTypes}
        loading={loading}
        itemLabel="design types"
        emptyMessage="No design types have been defined yet."
        chrome="flat"
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        pageCount={pageCount}
        totalCount={total}
        manualPagination
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onRowClick={canManageDesignTypes ? (row) => onEdit(row.original) : undefined}
      />
    </TableSurface>
  );
}
