import { BriefcaseBusiness, MapPin, Phone, UserSquare2 } from "lucide-react";
import type { EmployeeWithRelations } from "@tbms/shared-types";
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { FieldLabel } from "@tbms/ui/components/field";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { SectionIcon } from "@tbms/ui/components/section-icon";
import { Separator } from "@tbms/ui/components/separator";
import { formatDate, formatPKR } from "@/lib/utils";

interface EmployeeProfileSidebarProps {
  employee: EmployeeWithRelations;
}

export function EmployeeProfileSidebar({
  employee,
}: EmployeeProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
        >
          <SectionHeader
            title="Personal Info"
            icon={
              <SectionIcon tone="info">
                <UserSquare2 className="h-4 w-4" />
              </SectionIcon>
            }
          />
          <Badge
            variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"}

          >
            {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {employee.phone}
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{employee.address || "No address provided"}</span>
          </div>
          <Separator />
          <div className="space-y-3">
            <FieldLabel>Emergency Contact</FieldLabel>
            <div>
              <p className="text-sm font-bold">
                {employee.emergencyName || "Not set"}
              </p>
              <p className="text-xs text-muted-foreground">
                {employee.emergencyPhone || "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
        >
          <SectionHeader
            title="Employment"
            icon={
              <SectionIcon tone="info">
                <BriefcaseBusiness className="h-4 w-4" />
              </SectionIcon>
            }
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Join Date</span>
            <span className="font-medium">
              {formatDate(employee.dateOfJoining)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pay Model</span>
            <Badge variant="outline" className="text-xs">
              {PAYMENT_TYPE_LABELS[employee.paymentType] ??
                employee.paymentType}
            </Badge>
          </div>
          {employee.monthlySalary != null ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Salary</span>
              <span className="font-medium">
                {formatPKR(employee.monthlySalary)}
              </span>
            </div>
          ) : null}
          {employee.employmentEndDate ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Employment End</span>
              <span className="font-medium">
                {formatDate(employee.employmentEndDate)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Designation</span>
            <span className="font-medium">
              {employee.designation || "Staff"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
