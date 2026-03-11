import { RotateCcw, Search } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { TableSearch, TableToolbar } from "@tbms/ui/components/table-layout";

interface RatesSearchStatsProps {
  search: string;
  total: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function RatesSearchStats({
  search,
  total,
  onSearchChange,
  onClearSearch,
}: RatesSearchStatsProps) {
  const hasSearch = Boolean(search.trim());

  return (
    <TableToolbar
      title="Rate Card Directory"
      total={total}
      totalLabel="rates"
      controls={
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by step key or garment type..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="md:ml-auto"
            onClick={onClearSearch}
            disabled={!hasSearch}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </ActionStrip>
      }
      activeFilterCount={hasSearch ? 1 : 0}
    />
  );
}
