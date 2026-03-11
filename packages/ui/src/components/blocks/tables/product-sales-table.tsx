import * as React from "react";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tbms/ui/components/table";

export interface ProductSalesTableRow {
  id: string;
  name: string;
  revenue: number;
  share?: number;
}

export interface ProductSalesTableProps {
  title?: string;
  description?: string;
  rows: ProductSalesTableRow[];
  maxRows?: number;
  emptyText?: string;
  currencyFormatter?: (value: number) => string;
}

const defaultCurrencyFormatter = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function ProductSalesTable({
  title = "Top Selling Products",
  description = "Your highest performing products for this period.",
  rows,
  maxRows = 5,
  emptyText = "No product sales data available.",
  currencyFormatter = defaultCurrencyFormatter,
}: ProductSalesTableProps) {
  const normalizedRows = React.useMemo(() => {
    const ranked = [...rows].sort((a, b) => b.revenue - a.revenue);
    const selected = ranked.slice(0, maxRows);
    const totalRevenue = selected.reduce((sum, row) => sum + row.revenue, 0);

    return selected.map((row, index) => ({
      ...row,
      rank: index + 1,
      resolvedShare:
        typeof row.share === "number"
          ? row.share
          : totalRevenue > 0
            ? (row.revenue / totalRevenue) * 100
            : 0,
    }));
  }, [maxRows, rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">Rank</TableHead>
              <TableHead>Garment</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {normalizedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              normalizedRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Badge variant="secondary">#{row.rank}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.resolvedShare.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
