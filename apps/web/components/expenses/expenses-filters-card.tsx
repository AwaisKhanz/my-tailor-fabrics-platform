import { Filter, RotateCcw } from "lucide-react";
import { type ExpenseCategory } from "@/lib/api/expenses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ExpensesFilters } from "@/hooks/use-expenses-page";

interface ExpensesFiltersCardProps {
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
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle variant="dashboard">Quick Filters</CardTitle>
          </div>
          {hasFilters ? (
            <Badge variant="outline" size="xs" className="font-bold">
              {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label variant="dashboard">Category</Label>
            <Select
              value={filters.categoryId}
              onValueChange={onCategoryChange}
              disabled={categoriesLoading}
            >
              <SelectTrigger variant="premium" className="h-10">
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

          <div className="space-y-2">
            <Label variant="dashboard">Date Range (From)</Label>
            <Input
              variant="premium"
              type="date"
              className="h-10"
              value={filters.from}
              onChange={(event) => onFromChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label variant="dashboard">Date Range (To)</Label>
            <Input
              variant="premium"
              type="date"
              className="h-10"
              value={filters.to}
              onChange={(event) => onToChange(event.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-full text-xs font-bold text-muted-foreground hover:text-foreground"
              onClick={onReset}
              disabled={!hasFilters}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
