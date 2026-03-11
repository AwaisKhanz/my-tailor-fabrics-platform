import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tbms/ui/components/select";
import { TableSearch, TableToolbar } from "@tbms/ui/components/table-layout";
import {
  USER_ROLE_FILTER_OPTIONS,
  USERS_ALL_ROLES_LABEL,
  USERS_ALL_ROLES_FILTER_VALUE,
  type UserRoleFilter,
} from "@/hooks/use-users-page";

interface UsersListToolbarProps {
  search: string;
  roleFilter: UserRoleFilter;
  totalUsersCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

export function UsersListToolbar({
  search,
  roleFilter,
  totalUsersCount,
  hasActiveFilters,
  onSearchChange,
  onRoleFilterChange,
  onResetFilters,
}: UsersListToolbarProps) {
  const activeFilterCount =
    (search.trim() ? 1 : 0) + (roleFilter !== USERS_ALL_ROLES_FILTER_VALUE ? 1 : 0);
  const effectiveFilterCount = hasActiveFilters ? activeFilterCount : 0;

  return (
    <TableToolbar
      title="Staff Access Directory"
      total={totalUsersCount}
      totalLabel="results"
      activeFilterCount={effectiveFilterCount}
      controls={
        <>
          <TableSearch
            value={search}
            placeholder="Search by name, email, branch..."
            icon={<Search className="h-4 w-4" />}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="w-full md:w-56">
            <Select
              value={String(roleFilter)}
              onValueChange={(value) =>
                onRoleFilterChange(value ?? USERS_ALL_ROLES_FILTER_VALUE)
              }
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder={USERS_ALL_ROLES_LABEL} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {USER_ROLE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </>
      }
    />
  );
}
