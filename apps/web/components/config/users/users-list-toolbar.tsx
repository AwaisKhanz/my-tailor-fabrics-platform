import { Filter, RotateCcw, Search } from "lucide-react";
import { ROLES } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { USERS_ALL_ROLES_FILTER_VALUE, type UserRoleFilter } from "@/hooks/use-users-page";

interface UsersListToolbarProps {
  search: string;
  roleFilter: UserRoleFilter;
  totalUsers: number;
  filteredUsersCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

export function UsersListToolbar({
  search,
  roleFilter,
  totalUsers,
  filteredUsersCount,
  hasActiveFilters,
  onSearchChange,
  onRoleFilterChange,
  onResetFilters,
}: UsersListToolbarProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h2" variant="sectionTitle">
            Staff Access Directory
          </Typography>
          <Badge variant="secondary" size="xs" className="ring-1 ring-border">
            {filteredUsersCount} shown
          </Badge>
          {filteredUsersCount !== totalUsers ? (
            <Badge variant="outline" size="xs">
              {totalUsers} total
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="group relative flex-1">
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              variant="premium"
              className="h-10 bg-background pl-9"
              placeholder="Search by name, email, role, branch..."
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>

          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger variant="premium" className="h-10 w-full md:w-56">
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

          <Button
            variant="ghost"
            size="sm"
            className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
