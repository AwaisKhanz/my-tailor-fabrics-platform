"use client";

import {
  BriefcaseBusiness,
  Clock3,
  FileClock,
  UserRound,
} from "lucide-react";
import type {
  EmployeeCompensationHistoryEntry,
  EmployeeLedgerEntry,
  EmployeeWithRelations,
  OrderItemTask,
} from "@tbms/shared-types";
import type { EmployeeCapabilityWithStatus } from "@/hooks/use-employee-capabilities-manager";
import {
  LEDGER_ENTRY_TYPE_LABELS,
  PAYMENT_TYPE_LABELS,
  TASK_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { FieldLabel } from "@tbms/ui/components/field";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatDate, formatDateTime, formatPKR } from "@/lib/utils";

interface EmployeeOverviewTabProps {
  employee: EmployeeWithRelations;
  activeTaskCount: number;
  capabilitiesWithStatus: EmployeeCapabilityWithStatus[];
  garmentNameById: Map<string, string>;
  compensationHistory: EmployeeCompensationHistoryEntry[];
  tasks: OrderItemTask[];
  ledgerEntries: EmployeeLedgerEntry[];
}

function getCurrentCompensation(
  employee: EmployeeWithRelations,
  compensationHistory: EmployeeCompensationHistoryEntry[],
) {
  const now = Date.now();
  const sorted = [...compensationHistory].sort(
    (a, b) =>
      new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime(),
  );

  const active = sorted.find((entry) => {
    const start = new Date(entry.effectiveFrom).getTime();
    const end = entry.effectiveTo ? new Date(entry.effectiveTo).getTime() : null;
    return start <= now && (end === null || end >= now);
  });

  return (
    active ?? {
      id: "current",
      employeeId: employee.id,
      paymentType: employee.paymentType,
      monthlySalary: employee.monthlySalary ?? null,
      effectiveFrom: employee.dateOfJoining,
      effectiveTo: null,
      note: null,
      changedById: null,
      createdAt: employee.updatedAt,
    }
  );
}

function getNextCompensation(
  compensationHistory: EmployeeCompensationHistoryEntry[],
) {
  const now = Date.now();
  return [...compensationHistory]
    .filter((entry) => new Date(entry.effectiveFrom).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime(),
    )[0];
}

export function EmployeeOverviewTab({
  employee,
  activeTaskCount,
  capabilitiesWithStatus,
  garmentNameById,
  compensationHistory,
  tasks,
  ledgerEntries,
}: EmployeeOverviewTabProps) {
  const activeCapabilities = capabilitiesWithStatus.filter(
    (capability) => capability.status === "ACTIVE",
  );
  const upcomingCapabilities = capabilitiesWithStatus.filter(
    (capability) => capability.status === "UPCOMING",
  );
  const currentCompensation = getCurrentCompensation(
    employee,
    compensationHistory,
  );
  const nextCompensation = getNextCompensation(compensationHistory);
  const latestTask = [...tasks].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
  const latestLedger = [...ledgerEntries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <SectionHeader
              title="Current Snapshot"
              description="The current staff profile details that are not already covered in the page header."
              icon={<UserRound className="h-4 w-4 text-primary" />}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <FieldLabel>Address</FieldLabel>
                <p className="mt-2 text-sm text-muted-foreground">
                  {employee.address || "No address provided"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <FieldLabel>Emergency Contact</FieldLabel>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {employee.emergencyName || "Not set"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {employee.emergencyPhone || "No emergency phone recorded"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionHeader
              title="Employment Snapshot"
              description="Current compensation model, system access state, and any scheduled employment change."
              icon={<BriefcaseBusiness className="h-4 w-4 text-primary" />}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <StatsGrid columns="two" className="gap-3">
              <InfoTile tone="secondary" padding="content" className="space-y-1">
                <FieldLabel>Current Model</FieldLabel>
                <p className="text-base font-semibold text-foreground">
                  {PAYMENT_TYPE_LABELS[currentCompensation.paymentType] ??
                    currentCompensation.paymentType}
                </p>
                <p className="text-xs text-muted-foreground">
                  Effective {formatDate(currentCompensation.effectiveFrom)}
                </p>
              </InfoTile>
              <InfoTile tone="secondary" padding="content" className="space-y-1">
                <FieldLabel>Monthly Salary</FieldLabel>
                <p className="text-base font-semibold text-foreground">
                  {currentCompensation.monthlySalary != null
                    ? formatPKR(currentCompensation.monthlySalary)
                    : "Per-piece compensation"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(employee.dateOfJoining)}
                </p>
              </InfoTile>
            </StatsGrid>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <FieldLabel>Upcoming Compensation Change</FieldLabel>
                {nextCompensation ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {PAYMENT_TYPE_LABELS[nextCompensation.paymentType] ??
                        nextCompensation.paymentType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Starts {formatDate(nextCompensation.effectiveFrom)}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No scheduled compensation change.
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <FieldLabel>Portal Access</FieldLabel>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {employee.userAccount ? "Portal Account Active" : "Not provisioned"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {employee.userAccount
                    ? employee.userAccount.email
                    : employee.employmentEndDate
                      ? `Employment ends ${formatDate(employee.employmentEndDate)}`
                      : "Access not provisioned yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <SectionHeader
              title="Current Capability Snapshot"
              description="What this employee can actively work on right now."
              icon={<Clock3 className="h-4 w-4 text-primary" />}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCapabilities.length > 0 ? (
              activeCapabilities.map((capability) => (
                <div
                  key={capability.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {capability.garmentTypeId
                        ? garmentNameById.get(capability.garmentTypeId) ?? capability.garmentTypeId
                        : "Any Garment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {capability.stepKey || "Any Step"}
                      {capability.note ? ` • ${capability.note}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="outline">
                      Since {formatDate(capability.effectiveFrom)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <InfoTile borderStyle="dashedStrong" padding="contentLg" className="text-sm text-muted-foreground">
                No active capabilities configured yet.
              </InfoTile>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionHeader
              title="Readiness"
              description="Current workload and scheduled capability changes."
              icon={<Clock3 className="h-4 w-4 text-primary" />}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoTile tone="secondary" padding="content" className="space-y-1">
              <FieldLabel>Active capability windows</FieldLabel>
              <p className="text-2xl font-semibold text-foreground">
                {activeCapabilities.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {upcomingCapabilities.length} upcoming
              </p>
            </InfoTile>
            <InfoTile tone="secondary" padding="content" className="space-y-1">
              <FieldLabel>Open production tasks</FieldLabel>
              <p className="text-2xl font-semibold text-foreground">{activeTaskCount}</p>
              <p className="text-xs text-muted-foreground">
                Tasks still requiring employee attention
              </p>
            </InfoTile>
            <InfoTile tone="secondary" padding="content" className="space-y-1">
              <FieldLabel>Latest work update</FieldLabel>
              {latestTask ? (
                <>
                  <p className="text-sm font-semibold text-foreground">
                    {latestTask.stepName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {TASK_STATUS_LABELS[latestTask.status]} • {formatDateTime(latestTask.updatedAt)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No production updates yet.</p>
              )}
            </InfoTile>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Recent Activity"
            description="The latest operational and financial signals."
            icon={<FileClock className="h-4 w-4 text-primary" />}
          />
        </CardHeader>
        <CardContent>
          <StatsGrid columns="two" className="gap-4">
            <InfoTile tone="secondary" padding="contentLg" className="space-y-2">
              <FieldLabel>Task Activity</FieldLabel>
              {latestTask ? (
                <>
                  <p className="text-base font-semibold text-foreground">
                    {latestTask.item?.order.orderNumber || "Task update"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {latestTask.stepName} • {TASK_STATUS_LABELS[latestTask.status]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(latestTask.updatedAt)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No task activity recorded yet.</p>
              )}
            </InfoTile>

            <InfoTile tone="secondary" padding="contentLg" className="space-y-2">
              <FieldLabel>Ledger Activity</FieldLabel>
              {latestLedger ? (
                <>
                  <p className="text-base font-semibold text-foreground">
                    {LEDGER_ENTRY_TYPE_LABELS[latestLedger.type] ?? latestLedger.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPKR(latestLedger.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(latestLedger.createdAt)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No ledger entries yet.</p>
              )}
            </InfoTile>
          </StatsGrid>
        </CardContent>
      </Card>
    </div>
  );
}
