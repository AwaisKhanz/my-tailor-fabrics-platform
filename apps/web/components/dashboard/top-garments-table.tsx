"use client";

import type { GarmentRevenue } from "@tbms/shared-types";
import { LoadingState } from "@tbms/ui/components/loading-state";
import {
  ProductSalesTable,
  type ProductSalesTableRow,
} from "@tbms/ui/components/blocks/tables/product-sales-table";
import { formatPKR } from "@/lib/utils";

interface DashboardTopGarmentsTableProps {
  loading: boolean;
  garments: GarmentRevenue[];
}

export function DashboardTopGarmentsTable({
  loading,
  garments,
}: DashboardTopGarmentsTableProps) {
  const rows: ProductSalesTableRow[] = garments
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((garment, index) => ({
      id: `${garment.label}-${index}`,
      name: garment.label,
      revenue: garment.value,
    }));

  return (
    <div className="">
      {loading ? (
        <LoadingState
          compact
          text="Loading top garments..."
          caption="Calculating product-level sales trends."
          className="mb-3"
        />
      ) : null}

      <ProductSalesTable
        title="Top Garment Sales"
        description="Best performing garments by non-cancelled booked invoice value in the selected period."
        itemLabel="Garment"
        valueLabel="Booked Sales"
        rows={rows}
        emptyText="No garment sales data yet."
        currencyFormatter={formatPKR}
      />
    </div>
  );
}
