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
  ORDERS_ALL_STATUSES_LABEL,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_DATE_RANGE_OPTIONS,
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
                <SelectTrigger className="text-xs font-bold">
                  <SelectValue placeholder={ORDERS_ALL_STATUSES_LABEL} />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
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

            <div className="w-full sm:w-44">
              <Select
                value={dateRange}
                onValueChange={(value) => {
                  if (isOrdersDateRange(value)) {
                    onDateRangeChange(value);
                  }
                }}
              >
                <SelectTrigger className="text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_DATE_RANGE_OPTIONS.map((option) => (
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
              variant="ghost"
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
