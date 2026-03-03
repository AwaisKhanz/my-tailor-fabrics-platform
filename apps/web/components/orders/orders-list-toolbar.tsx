import { OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";
import type {
  OrdersDateRange,
  OrdersStatusFilter,
} from "@/hooks/use-orders-list-page";

interface OrdersListToolbarProps {
  total: number;
  search: string;
  statusFilter: OrdersStatusFilter;
  dateRange: OrdersDateRange;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrdersStatusFilter) => void;
  onDateRangeChange: (value: OrdersDateRange) => void;
  onReset: () => void;
}

const DATE_RANGE_OPTIONS: Array<{ value: OrdersDateRange; label: string }> = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
  { value: "all", label: "All Time" },
];

export function OrdersListToolbar({
  total,
  search,
  statusFilter,
  dateRange,
  activeFilterCount,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onReset,
}: OrdersListToolbarProps) {
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <TableToolbar
      title="Order Book"
      total={total}
      activeFilterCount={activeFilterCount}
      controls={
        <>
          <TableSearch
            placeholder="Search order # or customer..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="w-full md:w-40">
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusChange(value as OrdersStatusFilter)}
            >
              <SelectTrigger variant="table" className="text-xs font-bold">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs font-medium">
                  All Statuses
                </SelectItem>
                {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((status) => (
                  <SelectItem key={status} value={status} className="text-xs font-medium">
                    {ORDER_STATUS_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-40">
            <Select
              value={dateRange}
              onValueChange={(value) => onDateRangeChange(value as OrdersDateRange)}
            >
              <SelectTrigger variant="table" className="text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-xs font-medium"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="tableReset"
            size="sm"
            className="md:ml-auto"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
        </>
      }
    />
  );
}
