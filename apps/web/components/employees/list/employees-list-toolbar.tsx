import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";

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
  return (
    <TableToolbar
      title="Staff Directory"
      total={total}
      activeFilterCount={hasActiveFilters ? 1 : 0}
      controls={
        <>
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search employees by name, phone, code..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button
            variant="tableReset"
            size="sm"
            className="md:ml-auto"
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
