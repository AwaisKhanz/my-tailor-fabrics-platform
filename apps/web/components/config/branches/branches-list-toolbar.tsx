import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";

interface BranchesListToolbarProps {
  totalCount: number;
  search: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
}

export function BranchesListToolbar({
  totalCount,
  search,
  hasActiveFilters,
  onSearchChange,
  onResetFilters,
}: BranchesListToolbarProps) {
  return (
    <TableToolbar
      title="Location Directory"
      total={totalCount}
      activeFilterCount={hasActiveFilters ? 1 : 0}
      controls={
        <>
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by branch name, code, phone, or address..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Button
            variant="ghost"
            size="sm"
            className="md:ml-auto"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </>
      }
    />
  );
}
