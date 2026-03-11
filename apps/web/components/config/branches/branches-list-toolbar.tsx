import { RotateCcw } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import {
  TableSearch,
  TableToolbar,
} from "@tbms/ui/components/table-layout";

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
      totalLabel="branches"
      activeFilterCount={hasActiveFilters ? 1 : 0}
      controls={
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            value={search}
            placeholder="Search by branch name, code, phone, or address..."
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            className="md:ml-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </ActionStrip>
      }
    />
  );
}
