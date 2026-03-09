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
  DEFAULT_CUSTOMER_STATUS_TAB,
  CUSTOMER_STATUS_TAB_OPTIONS,
  isCustomerStatusTab,
  type CustomerStatusTab,
} from "@/hooks/use-customers-page";

interface CustomersListToolbarProps {
  total: number;
  search: string;
  statusTab: CustomerStatusTab;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CustomerStatusTab) => void;
  onReset: () => void;
}

export function CustomersListToolbar({
  total,
  search,
  statusTab,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onReset,
}: CustomersListToolbarProps) {
  const activeFilterCount =
    (search.trim().length > 0 ? 1 : 0) +
    (statusTab !== DEFAULT_CUSTOMER_STATUS_TAB ? 1 : 0);

  return (
    <TableToolbar
      title="Client Directory"
      total={total}
      totalLabel="customers"
      activeFilterCount={activeFilterCount}
      controls={
        <>
          <TableSearch
            placeholder="Name, phone, size..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="w-full md:w-52">
            <Select
              value={statusTab}
              onValueChange={(value) => {
                if (isCustomerStatusTab(value)) {
                  onStatusChange(value);
                }
              }}
            >
              <SelectTrigger className="text-sm font-semibold">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_STATUS_TAB_OPTIONS.map((tab) => (
                  <SelectItem key={tab.key} value={tab.key} className="text-sm font-medium">
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center md:ml-auto md:w-auto md:justify-start"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </>
      }
    />
  );
}
