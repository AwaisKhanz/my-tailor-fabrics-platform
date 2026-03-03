import { Search } from "lucide-react";
import { OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
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
    <div className="border-b border-border/50 bg-muted/5 px-6 py-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Typography as="h2" variant="sectionTitle">
              Order Book
            </Typography>
            <Badge variant="secondary" size="xs">
              {total} results
            </Badge>
            {hasActiveFilters ? (
              <Badge variant="outline" size="xs" className="font-bold">
                {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="group relative min-w-[280px] flex-1">
            <Input
              placeholder="Search order # or customer..."
              variant="premium"
              className="h-10 bg-background pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>

          <div className="w-40">
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusChange(value as OrdersStatusFilter)}
            >
              <SelectTrigger className="h-10 border-border bg-background text-[11px] font-bold shadow-none">
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

          <div className="w-40">
            <Select
              value={dateRange}
              onValueChange={(value) => onDateRangeChange(value as OrdersDateRange)}
            >
              <SelectTrigger className="h-10 border-border bg-background text-[11px] font-bold shadow-none">
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
            variant="ghost"
            size="sm"
            className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
