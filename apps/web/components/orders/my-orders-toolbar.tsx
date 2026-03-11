import { RotateCcw, Search } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { TableSearch, TableToolbar } from "@tbms/ui/components/table-layout";

interface MyOrdersToolbarProps {
  search: string;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function MyOrdersToolbar({
  search,
  totalCount,
  filteredCount,
  onSearchChange,
  onClearSearch,
}: MyOrdersToolbarProps) {
  const hasSearch = search.trim().length > 0;
  const visibleCount = hasSearch ? filteredCount : totalCount;

  return (
    <TableToolbar
      title="Assigned Work Queue"
      total={visibleCount}
      totalLabel="items"
      activeFilterCount={hasSearch ? 1 : 0}
      controls={
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Order #, garment type..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            disabled={!hasSearch}
            className="md:ml-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear Search
          </Button>
        </ActionStrip>
      }
    />
  );
}
