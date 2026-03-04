import { Filter, RotateCcw, Search } from "lucide-react";
import { ROLES } from "@tbms/shared-constants";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSearch, TableToolbar } from "@/components/ui/table-layout";
import { USERS_ALL_ROLES_FILTER_VALUE, type UserRoleFilter } from "@/hooks/use-users-page";

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
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, branch..."
          />

          <div className="w-full md:w-56">
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger variant="table" className="w-full text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={USERS_ALL_ROLES_FILTER_VALUE}>All Roles</SelectItem>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="tableReset"
            size="sm"
            className="md:ml-auto"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </>
      }
    />
  );
}
