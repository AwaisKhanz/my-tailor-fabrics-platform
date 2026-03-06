import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";

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
            icon={<Search className="h-4 w-4" />}
            placeholder="Search garment name..."
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
            variant="ghost"
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
