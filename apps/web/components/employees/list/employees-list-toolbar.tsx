import { RotateCcw, Search } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { TableSearch, TableToolbar } from "@tbms/ui/components/table-layout";

interface EmployeesListToolbarProps {
  total: number;
  search: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function EmployeesListToolbar({
  total,
  search,
  hasActiveFilters,
  onSearchChange,
  onReset,
}: EmployeesListToolbarProps) {
  const activeFilterCount = search.trim().length > 0 ? 1 : 0;

  return (
    <TableToolbar
      title="Staff Directory"
      total={total}
      totalLabel="employees"
      activeFilterCount={activeFilterCount}
      controls={
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search employees by name, phone, code..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
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
        </ActionStrip>
      }
    />
  );
}
