import { RotateCcw, Search } from "lucide-react";
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

interface AuditLogsFilterOption {
  value: string;
  label: string;
}

interface AuditLogsFilterState {
  search: string;
  action: string;
  entity: string;
  from: string;
  to: string;
}

interface AuditLogsFilterToolbarProps {
  total: number;
  activeFilterCount: number;
  filters: AuditLogsFilterState;
  actionFilterOptions: AuditLogsFilterOption[];
  entityFilterOptions: AuditLogsFilterOption[];
  allActionsLabel: string;
  allEntitiesLabel: string;
  onSetFilter: (
    key: keyof AuditLogsFilterState,
    value: string,
  ) => void;
  onResetFilters: () => void;
}

export function AuditLogsFilterToolbar({
  total,
  activeFilterCount,
  filters,
  actionFilterOptions,
  entityFilterOptions,
  allActionsLabel,
  allEntitiesLabel,
  onSetFilter,
  onResetFilters,
}: AuditLogsFilterToolbarProps) {
  return (
    <TableToolbar
      title="Audit Trail"
      total={total}
      totalLabel="events"
      activeFilterCount={activeFilterCount}
      controls={(
        <div className="flex w-full flex-wrap items-center gap-3">
          <TableSearch
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by user, action, or entity..."
            value={filters.search}
            onChange={(event) => onSetFilter("search", event.target.value)}
          />

          <Select
            value={filters.action}
            onValueChange={(value) => onSetFilter("action", value ?? "")}
          >
            <SelectTrigger className="w-full md:w-[170px]">
              <SelectValue placeholder={allActionsLabel} />
            </SelectTrigger>
            <SelectContent>
              {actionFilterOptions.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.entity}
            onValueChange={(value) => onSetFilter("entity", value ?? "")}
          >
            <SelectTrigger className="w-full md:w-[170px]">
              <SelectValue placeholder={allEntitiesLabel} />
            </SelectTrigger>
            <SelectContent>
              {entityFilterOptions.map((entity) => (
                <SelectItem key={entity.value} value={entity.value}>
                  {entity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            className="w-full md:w-[170px]"
            value={filters.from}
            onChange={(event) => onSetFilter("from", event.target.value)}
          />
          <Input
            type="date"
            className="w-full md:w-[170px]"
            value={filters.to}
            onChange={(event) => onSetFilter("to", event.target.value)}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            disabled={activeFilterCount === 0}
            className="md:ml-auto"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      )}
    />
  );
}
