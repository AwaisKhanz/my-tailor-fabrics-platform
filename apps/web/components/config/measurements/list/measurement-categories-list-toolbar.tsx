import { RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

interface MeasurementCategoriesListToolbarProps {
  total: number;
  search: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function MeasurementCategoriesListToolbar({
  total,
  search,
  hasActiveFilters,
  onSearchChange,
  onReset,
}: MeasurementCategoriesListToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/50 px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Typography as="h2" variant="sectionTitle">
          Categories Inventory
        </Typography>
        <Badge variant="secondary" size="xs" className="ring-1 ring-border">
          {total} results
        </Badge>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="group relative flex-1 sm:w-64">
          <Input
            placeholder="Search categories..."
            variant="premium"
            className="h-10 pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
