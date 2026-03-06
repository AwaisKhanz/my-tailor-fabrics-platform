import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  /** Number of skeleton rows to render */
  rows?: number;
  /** Number of columns to render */
  cols?: number;
  /** Whether to show a header row */
  showHeader?: boolean;
  /** Whether to render built-in table container chrome */
  chrome?: "framed" | "flat";
}

/**
 * A standardized loading skeleton for data tables.
 * Use this in the `loading` branch of every list page.
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
  showHeader = true,
  chrome = "framed",
}: TableSkeletonProps) {
  const table = (
    <Table className="bg-card">
      {showHeader && (
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (chrome === "flat") {
    return table;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {table}
    </div>
  );
}
