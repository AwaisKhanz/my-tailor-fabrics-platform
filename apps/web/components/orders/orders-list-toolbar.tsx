import { OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";
import {
  isOrdersDateRange,
  isOrdersStatusFilter,
  type OrdersDateRange,
  type OrdersStatusFilter,
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

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.OVERDUE,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
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
      totalLabel="orders"
      activeFilterCount={activeFilterCount}
      controls={
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
          <TableSearch
            placeholder="Search order # or customer..."
            value={search}
            className="lg:max-w-2xl"
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (isOrdersStatusFilter(value)) {
                    onStatusChange(value);
                  }
                }}
              >
                <SelectTrigger variant="table" className="text-xs font-bold">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs font-medium">
                    All Statuses
                  </SelectItem>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs font-medium">
                      {ORDER_STATUS_CONFIG[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={dateRange}
                onValueChange={(value) => {
                  if (isOrdersDateRange(value)) {
                    onDateRangeChange(value);
                  }
                }}
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
          </div>

          <div className="flex w-full justify-end lg:ml-auto lg:w-auto">
            <Button
              variant="tableReset"
              size="sm"
              onClick={onReset}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      }
    />
  );
}
