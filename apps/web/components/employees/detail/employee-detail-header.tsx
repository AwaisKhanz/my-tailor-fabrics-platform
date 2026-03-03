import { CalendarDays, Edit2, MapPin, Phone, UserPlus } from "lucide-react";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { EMPLOYEE_STATUS_BADGE, EMPLOYEE_STATUS_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface EmployeeDetailHeaderProps {
  employee: EmployeeWithRelations;
  onProvisionAccount: () => void;
  onEditProfile: () => void;
}

export function EmployeeDetailHeader({
  employee,
  onProvisionAccount,
  onEditProfile,
}: EmployeeDetailHeaderProps) {
  const joinDateLabel = formatDate(employee.dateOfJoining);
  const hasAccount = Boolean(employee.userAccount);

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 lg:max-w-[70%]">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Employee Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {employee.fullName}
              </h1>
              <Badge
                variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
              >
                {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
              </Badge>
              <Badge variant="outline" size="xs" className="font-semibold">
                {employee.employeeCode}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{employee.phone}</span>
              </div>
              {employee.city ? (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{employee.city}</span>
                </div>
              ) : null}
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Joined {joinDateLabel}</span>
              </div>
              <div className="inline-flex items-center rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5 font-semibold text-foreground">
                {employee.designation || "Staff"}
              </div>
            </div>
          </div>

          <div
            className={`flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end ${hasAccount ? "lg:max-w-[260px]" : "lg:max-w-[520px]"}`}
          >
            {!hasAccount ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[220px]"
                onClick={onProvisionAccount}
              >
                <UserPlus className="h-4 w-4" />
                Provision Account
              </Button>
            ) : null}
            <Button
              variant="premium"
              size="lg"
              className="w-full justify-center sm:w-auto sm:min-w-[220px]"
              onClick={onEditProfile}
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
