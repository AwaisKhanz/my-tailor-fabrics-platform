import { RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-end">
      <div className="flex min-w-[240px] max-w-sm flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Label variant="dashboard" className="ml-1">
            Search My Orders
          </Label>
          <Badge variant="secondary" size="xs">
            {filteredCount}/{totalCount}
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            variant="premium"
            placeholder="Order #, garment type..."
            className="pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-end">
        <Button
          variant="muted"
          size="sm"
          className="h-10 w-full px-4 lg:w-auto"
          onClick={onClearSearch}
          disabled={!hasSearch}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Clear Search
        </Button>
      </div>
    </div>
  );
}
