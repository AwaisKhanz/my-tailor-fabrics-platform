import { Filter, RotateCcw, Search } from "lucide-react";
import { ActionStrip } from "@tbms/ui/components/action-strip";
import { Button } from "@tbms/ui/components/button";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { TableSearch, TableToolbar } from "@tbms/ui/components/table-layout";
import {
  EXPENSES_ALL_CATEGORIES_FILTER,
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
      controls={(
        <ActionStrip width="full" align="start" className="gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by category or description..."
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Select
            value={filters.categoryId}
            onValueChange={(value) =>
              onCategoryChange(value ?? EXPENSES_ALL_CATEGORIES_FILTER)
            }
            disabled={categoriesLoading}
          >
            <SelectTrigger className="w-full md:w-56">
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
                  <span className="inline-flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5" />
                    {category.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            className="w-full md:w-48"
            value={filters.from}
            onChange={(event) => onFromChange(event.target.value)}
          />
          <Input
            type="date"
            className="w-full md:w-48"
            value={filters.to}
            onChange={(event) => onToChange(event.target.value)}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasFilters}
            className="md:ml-auto"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </ActionStrip>
      )}
    />
  );
}
