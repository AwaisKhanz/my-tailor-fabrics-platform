"use client";

import { useMemo } from "react";
import {
  Activity,
  History,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { AuditLogEntry } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import {
  TableSearch,
  TableSurface,
  TableToolbar,
} from "@/components/ui/table-layout";
import {
  AUDIT_ALL_ACTIONS_LABEL,
  AUDIT_ALL_ENTITIES_LABEL,
  useAuditLogsPage,
} from "@/hooks/use-audit-logs-page";
import { createAuditLogColumns } from "@/components/config/audit-logs/audit-log-table-columns";

export function AuditLogsPage() {
  const {
    loading,
    records,
    total,
    stats,
    page,
    pageSize,
    filters,
    activeFilterCount,
    actionFilterOptions,
    entityFilterOptions,
    setPage,
    setFilter,
    resetFilters,
    refresh,
  } = useAuditLogsPage();

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => createAuditLogColumns(),
    [],
  );

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Audit Logs"
          description="Track security and data changes across users, entities, and actions."
          density="compact"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />
      </PageSection>

      <PageSection spacing="compact" className="grid space-y-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Events"
          subtitle="matching filters"
          value={stats.total.toLocaleString()}
          tone="primary"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Unique Users"
          subtitle="active actors"
          value={stats.uniqueUsers.toLocaleString()}
          tone="info"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Create Events"
          subtitle="write operations"
          value={stats.createCount.toLocaleString()}
          tone="success"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Update Events"
          subtitle="modified records"
          value={stats.updateCount.toLocaleString()}
          tone="info"
          icon={<History className="h-4 w-4" />}
        />
        <StatCard
          title="Delete Events"
          subtitle="destructive operations"
          value={stats.deleteCount.toLocaleString()}
          tone="destructive"
          icon={<Trash2 className="h-4 w-4" />}
        />
        <StatCard
          title="Login Events"
          subtitle="access activity"
          value={stats.loginCount.toLocaleString()}
          tone="warning"
          icon={<UserCheck className="h-4 w-4" />}
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <TableToolbar
            title="Audit Trail"
            total={total}
            totalLabel="events"
            activeFilterCount={activeFilterCount}
            controls={
              <>
                <TableSearch
                  icon={<Search className="h-4 w-4" />}
                  placeholder="Search by user, action, or entity..."
                  value={filters.search}
                  onChange={(event) => setFilter("search", event.target.value)}
                />
                <div className="w-full md:w-[170px]">
                  <Select
                    value={filters.action}
                    onValueChange={(value) => setFilter("action", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={AUDIT_ALL_ACTIONS_LABEL} />
                    </SelectTrigger>
                    <SelectContent>
                      {actionFilterOptions.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[170px]">
                  <Select
                    value={filters.entity}
                    onValueChange={(value) => setFilter("entity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={AUDIT_ALL_ENTITIES_LABEL} />
                    </SelectTrigger>
                    <SelectContent>
                      {entityFilterOptions.map((entity) => (
                        <SelectItem key={entity.value} value={entity.value}>
                          {entity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="date"
                 
                  className="w-full md:w-[170px]"
                  value={filters.from}
                  onChange={(event) => setFilter("from", event.target.value)}
                />
                <Input
                  type="date"
                 
                  className="w-full md:w-[170px]"
                  value={filters.to}
                  onChange={(event) => setFilter("to", event.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="md:ml-auto"
                  onClick={resetFilters}
                  disabled={activeFilterCount === 0}
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Reset
                </Button>
              </>
            }
          />

          <DataTable
            columns={columns}
            data={records}
            loading={loading}
            emptyMessage="No audit events found for the selected filters."
            itemLabel="events"
            chrome="flat"
            page={page}
            total={total}
            limit={pageSize}
            onPageChange={setPage}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}
