import { CalendarDays, Edit2, MapPin, Phone, UserPlus } from "lucide-react";
import type { EmployeeWithRelations } from "@tbms/shared-types";
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent } from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import { MetaPill } from "@tbms/ui/components/meta-pill";
import { Heading } from "@tbms/ui/components/typography";
import { formatDate } from "@/lib/utils";

interface EmployeeDetailHeaderProps {
  employee: EmployeeWithRelations;
  onProvisionAccount: () => void;
  onEditProfile: () => void;
  canProvisionAccount?: boolean;
  canEditProfile?: boolean;
}

export function EmployeeDetailHeader({
  employee,
  onProvisionAccount,
  onEditProfile,
  canProvisionAccount = true,
  canEditProfile = true,
}: EmployeeDetailHeaderProps) {
  const joinDateLabel = formatDate(employee.dateOfJoining);
  const hasAccount = Boolean(employee.userAccount);

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 lg:max-w-[70%]">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Employee Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <Heading
                as="h1"
                variant="page"
                className="font-semibold sm:text-4xl"
              >
                {employee.fullName}
              </Heading>
              <Badge
                variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"}
                className="px-2.5 py-1 text-xs font-bold uppercase "
              >
                {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
              </Badge>
              <Badge variant="outline" className="font-semibold">
                {employee.employeeCode}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <MetaPill>
                <Phone className="h-3.5 w-3.5" />
                <span>{employee.phone}</span>
              </MetaPill>
              {employee.city ? (
                <MetaPill>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{employee.city}</span>
                </MetaPill>
              ) : null}
              <MetaPill>
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Joined {joinDateLabel}</span>
              </MetaPill>
              <MetaPill tone="strong">
                {employee.designation || "Staff"}
              </MetaPill>
            </div>
          </div>

          <div
            className={`flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end ${hasAccount ? "lg:max-w-[260px]" : "lg:max-w-[520px]"}`}
          >
            {!hasAccount && canProvisionAccount ? (
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
            {canEditProfile ? (
              <Button
                variant="default"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[220px]"
                onClick={onEditProfile}
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
