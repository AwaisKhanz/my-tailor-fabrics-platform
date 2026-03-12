"use client";

import * as React from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { DataTableColumnHeader } from "@tbms/ui/components/data-table-column-header";
import { LoadingState } from "@tbms/ui/components/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tbms/ui/components/table";
import { TableSkeleton } from "@tbms/ui/components/table-skeleton";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { Text } from "@tbms/ui/components/typography";
import { cn } from "@tbms/ui/lib/utils";

interface DataTableTanstackProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  itemLabel?: string;
  className?: string;
  chrome?: "framed" | "flat";
  // Server/client pagination
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  totalCount?: number;
  manualPagination?: boolean;
  // Server/client sorting
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  // Optional selection
  enableRowSelection?: boolean;
  // Optional row interactions
  onRowClick?: (row: Row<TData>) => void;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
}

export function DataTableTanstack<TData>({
  columns,
  data,
  loading = false,
  toolbar,
  emptyMessage = "No results.",
  itemLabel = "items",
  className,
  chrome = "framed",
  pagination,
  onPaginationChange,
  pageCount,
  totalCount,
  manualPagination = false,
  sorting,
  onSortingChange,
  manualSorting = false,
  enableRowSelection = false,
  onRowClick,
  renderExpandedRow,
  getRowId,
}: DataTableTanstackProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange: setRowSelection,
    manualPagination,
    manualSorting,
    pageCount,
    enableRowSelection,
    getRowId,
  });

  const totalPages = pageCount > 0 ? pageCount : 1;
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const displayTotal = totalCount ?? data.length;
  const from = displayTotal === 0 ? 0 : pageIndex * pageSize + 1;
  const to =
    displayTotal === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, displayTotal);

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {toolbar}
        <LoadingState
          compact
          text="Loading records..."
          caption="Fetching latest table data."
        />
        <TableSkeleton rows={pageSize} cols={columns.length} chrome="flat" />
      </div>
    );
  }

  const tableContent = (
    <>
      {toolbar}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (() => {
                      const headerDef = header.column.columnDef.header;
                      if (typeof headerDef === "string") {
                        return (
                          <DataTableColumnHeader
                            column={header.column}
                            title={headerDef}
                          />
                        );
                      }
                      return flexRender(headerDef, header.getContext());
                    })()}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(
                      (onRowClick || renderExpandedRow) &&
                        "cursor-pointer hover:bg-muted/40",
                    )}
                    onClick={() => {
                      if (renderExpandedRow) {
                        setExpandedRowId((current) =>
                          current === row.id ? null : row.id,
                        );
                      }
                      onRowClick?.(row);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {renderExpandedRow && expandedRowId === row.id ? (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={columns.length} className="p-4">
                        {renderExpandedRow(row)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{from}</span> to{" "}
          <span className="font-semibold text-foreground">{to}</span> of{" "}
          <span className="font-semibold text-foreground">{displayTotal}</span>{" "}
          {itemLabel}
          {enableRowSelection ? (
            <>
              {" "}
              •{" "}
              <span className="font-semibold text-foreground">
                {selectedRowsCount}
              </span>{" "}
              selected
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Text as="span" variant="muted" className="text-xs">
            Page {pageIndex + 1} of {totalPages}
          </Text>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  if (chrome === "flat") {
    return <div className={className}>{tableContent}</div>;
  }

  return (
    <TableSurface className={className} shadow="none">
      {tableContent}
    </TableSurface>
  );
}
