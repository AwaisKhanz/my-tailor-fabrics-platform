import { Filter, RotateCcw } from "lucide-react";
import { type ExpenseCategory } from "@/lib/api/expenses";
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
import { TableToolbar } from "@/components/ui/table-layout";
import { type ExpensesFilters } from "@/hooks/use-expenses-page";

interface ExpensesFiltersCardProps {
  total: number;
  categories: ExpenseCategory[];
  categoriesLoading: boolean;
  filters: ExpensesFilters;
  activeFilterCount: number;
  onCategoryChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}

export function ExpensesFiltersCard({
  total,
  categories,
  categoriesLoading,
  filters,
  activeFilterCount,
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
      activeFilterCount={activeFilterCount}
      controls={
        <>
          <div className="w-full md:w-[220px]">
            <Label variant="dashboard" className="mb-2 block">
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
              <SelectTrigger variant="table">
                <SelectValue
                  placeholder={categoriesLoading ? "Loading categories..." : "All Categories"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-[180px]">
            <Label variant="dashboard" className="mb-2 block">
              Date Range (From)
            </Label>
            <Input
              variant="table"
              type="date"
              value={filters.from}
              onChange={(event) => onFromChange(event.target.value)}
            />
          </div>

          <div className="w-full md:w-[180px]">
            <Label variant="dashboard" className="mb-2 block">
              Date Range (To)
            </Label>
            <Input
              variant="table"
              type="date"
              value={filters.to}
              onChange={(event) => onToChange(event.target.value)}
            />
          </div>

          <Button
            variant="tableReset"
            size="sm"
            className="md:ml-auto md:self-end"
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
