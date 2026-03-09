import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";
import {
  EXPENSES_ALL_CATEGORIES_LABEL,
  type ExpensesFilters,
} from "@/hooks/use-expenses-page";

interface ExpensesFiltersCardProps {
  total: number;
  categoryFilterOptions: {
    value: string;
    label: string;
  }[];
  categoriesLoading: boolean;
  filters: ExpensesFilters;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}

export function ExpensesFiltersCard({
  total,
  categoryFilterOptions,
  categoriesLoading,
  filters,
  activeFilterCount,
  onSearchChange,
  onCategoryChange,
  onFromChange,
  onToChange,
  onReset,
}: ExpensesFiltersCardProps) {
  const hasFilters = activeFilterCount > 0;

  return (
    <TableToolbar
      title="Expense Ledger"
      total={total}
      totalLabel="expenses"
      activeFilterCount={activeFilterCount}
      controls={
        <>
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by category or description..."
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="w-full sm:w-[220px]">
            <Label className="text-sm font-bold uppercase  text-muted-foreground mb-2 block">
              <span className="inline-flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Category
              </span>
            </Label>
            <Select
              value={filters.categoryId}
              onValueChange={onCategoryChange}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Loading categories..."
                      : EXPENSES_ALL_CATEGORIES_LABEL
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categoryFilterOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[180px]">
            <Label className="text-sm font-bold uppercase  text-muted-foreground mb-2 block">
              Date From
            </Label>
            <Input
              type="date"
              value={filters.from}
              onChange={(event) => onFromChange(event.target.value)}
            />
          </div>

          <div className="w-full sm:w-[180px]">
            <Label className="text-sm font-bold uppercase  text-muted-foreground mb-2 block">
              Date To
            </Label>
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => onToChange(event.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center sm:ml-auto sm:w-auto sm:self-end"
            onClick={onReset}
            disabled={!hasFilters}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </>
      }
    />
  );
}
