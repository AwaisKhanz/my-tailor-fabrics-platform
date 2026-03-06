import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";

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
            icon={<Search className="h-4 w-4" />}
            placeholder="Search categories..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Button
            variant={includeArchived ? "default" : "outline"}
            size="sm"
            onClick={() => onIncludeArchivedChange(!includeArchived)}
          >
            {includeArchived ? "Showing Archived" : "Show Archived"}
          </Button>

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
