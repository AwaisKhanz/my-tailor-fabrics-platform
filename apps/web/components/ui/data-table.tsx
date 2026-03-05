"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  // Pagination
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  // Metadata
  itemLabel?: string;
  // Layout
  chrome?: "framed" | "flat";
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data = [],
  loading,
  onRowClick,
  page,
  total,
  limit = 10,
  onPageChange,
  emptyMessage = "No results found.",
  itemLabel = "items",
  chrome = "framed",
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const from = total === 0 ? 0 : page && limit ? (page - 1) * limit + 1 : 0;
  const to = total && page && limit ? Math.min(page * limit, total) : 0;

  const getPaginationPages = () => {
    if (!page || !totalPages) return [];
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 5) pages.push("...");
      if (page > 4 && page < totalPages - 3) pages.push(page);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return <TableSkeleton rows={limit} cols={columns.length} chrome={chrome} />;
  }

  const tableContent = (
    <>
      <div className="overflow-x-auto ">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="bg-surface-elevated ">
              {columns.map((column, idx) => (
                <TableHead
                  key={idx}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 border-b border-borderStrong/70 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-divider">
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-5 py-16 text-center bg-surface-elevated"
                >
                  <Typography as="p" variant="lead">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "hover:bg-interaction-hover/60 transition-colors group bg-surface-elevated border-b border-borderStrong/70",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIdx) => (
                    <TableCell
                      key={colIdx}
                      className={cn(
                        "px-4 py-3.5",
                        column.align === "right" && "text-right",
                        column.align === "center" && "text-center",
                        column.className,
                      )}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                          ? (item[column.accessorKey] as React.ReactNode)
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && onPageChange && page && (
        <div className="flex items-center justify-between border-t border-borderStrong/70 bg-surface-elevated px-5 py-3.5">
          <Typography as="p" variant="muted">
            Showing <span className="font-bold text-text-primary">{from}</span>{" "}
            to <span className="font-bold text-text-primary">{to}</span> of{" "}
            <span className="font-bold text-text-primary">{total}</span>{" "}
            {itemLabel}
          </Typography>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 w-8 rounded-lg border-divider bg-inputSurface-background hover:bg-interaction-hover disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPaginationPages().map((p, i) =>
              p === "..." ? (
                <Typography
                  as="span"
                  variant="body"
                  key={`ellipsis-${i}`}
                  className="h-8 w-8 flex items-center justify-center text-text-secondary text-sm"
                >
                  ...
                </Typography>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(p as number)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                    page === p
                      ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "border-divider bg-inputSurface-background text-text-primary hover:bg-interaction-hover",
                  )}
                >
                  {p}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 w-8 rounded-lg border-divider bg-inputSurface-background hover:bg-interaction-hover disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );

  if (chrome === "flat") {
    return tableContent;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-borderStrong/70 bg-surface-elevated shadow-[0_1px_2px_hsl(var(--shadow-color)/0.08)]">
      {tableContent}
    </div>
  );
}
