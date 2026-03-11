import { RotateCcw, Search } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { TableSearch, TableToolbar } from "@tbms/ui/components/table-layout";
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
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search order # or customer..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Select
            value={String(statusFilter)}
            onValueChange={(value) => {
              if (value && isOrdersStatusFilter(value)) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder={ORDERS_ALL_STATUSES_LABEL} />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(dateRange)}
            onValueChange={(value) => {
              if (value && isOrdersDateRange(value)) {
                onDateRangeChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="md:ml-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </ActionStrip>
      }
    />
  );
}
