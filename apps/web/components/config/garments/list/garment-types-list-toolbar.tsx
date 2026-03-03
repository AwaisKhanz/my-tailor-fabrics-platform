import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";

interface GarmentTypesListToolbarProps {
  totalCount: number;
  search: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function GarmentTypesListToolbar({
  totalCount,
  search,
  hasActiveFilters,
  onSearchChange,
  onReset,
}: GarmentTypesListToolbarProps) {
  return (
    <TableToolbar
      title="Garment Type Inventory"
      total={totalCount}
      activeFilterCount={hasActiveFilters ? 1 : 0}
      controls={
        <>
          <TableSearch
            icon={<Filter className="h-4 w-4" />}
            placeholder="Search garments..."
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
