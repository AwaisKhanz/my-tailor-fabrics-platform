import { RotateCcw } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  TableSearch,
  TableToolbar,
} from "@tbms/ui/components/table-layout";

interface GarmentTypesListToolbarProps {
  totalCount: number;
  search: string;
  includeArchived: boolean;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onIncludeArchivedChange: (next: boolean) => void;
  onReset: () => void;
}

export function GarmentTypesListToolbar({
  totalCount,
  search,
  includeArchived,
  activeFilterCount,
  onSearchChange,
  onIncludeArchivedChange,
  onReset,
}: GarmentTypesListToolbarProps) {
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <TableToolbar
      title="Garment Type Inventory"
      total={totalCount}
      totalLabel="types"
      activeFilterCount={activeFilterCount}
      controls={
        <>
          <TableSearch
            placeholder="Search garment name..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Button
            variant={includeArchived ? "default" : "outline"}
            onClick={() => onIncludeArchivedChange(!includeArchived)}
          >
            {includeArchived ? "Showing Archived" : "Show Archived"}
          </Button>

          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </>
      }
    />
  );
}
