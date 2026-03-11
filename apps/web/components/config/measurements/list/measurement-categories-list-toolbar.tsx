import { RotateCcw } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  TableSearch,
  TableToolbar,
} from "@tbms/ui/components/table-layout";

interface MeasurementCategoriesListToolbarProps {
  total: number;
  search: string;
  includeArchived: boolean;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onIncludeArchivedChange: (next: boolean) => void;
  onReset: () => void;
}

export function MeasurementCategoriesListToolbar({
  total,
  search,
  includeArchived,
  activeFilterCount,
  onSearchChange,
  onIncludeArchivedChange,
  onReset,
}: MeasurementCategoriesListToolbarProps) {
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <TableToolbar
      title="Categories Inventory"
      total={total}
      totalLabel="categories"
      activeFilterCount={activeFilterCount}
      controls={
        <>
          <TableSearch
            placeholder="Search categories..."
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
