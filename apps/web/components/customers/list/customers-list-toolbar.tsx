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
  CUSTOMER_ALL_STATUSES_LABEL,
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
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Name, phone, size..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Select
            value={String(statusTab)}
            onValueChange={(value) => {
              if (value && isCustomerStatusTab(value)) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder={CUSTOMER_ALL_STATUSES_LABEL} />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_STATUS_TAB_OPTIONS.map((tab) => (
                <SelectItem key={tab.key} value={tab.key}>
                  {tab.label}
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
