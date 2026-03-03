import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";

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
      activeFilterCount={hasSearch ? 1 : 0}
      controls={
        <>
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            type="text"
            placeholder="Order #, garment type..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button
            variant="tableReset"
            size="sm"
            className="md:ml-auto"
            onClick={onClearSearch}
            disabled={!hasSearch}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Clear Search
          </Button>
        </>
      }
      className="px-5 py-4"
    />
  );
}
