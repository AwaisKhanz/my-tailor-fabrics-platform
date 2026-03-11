import { BriefcaseBusiness, MapPin, Phone, UserSquare2 } from "lucide-react";
import type { EmployeeWithRelations } from "@tbms/shared-types";
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Separator } from "@/components/ui/separator";
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
          density="compact"
          layout="rowBetweenResponsive"
          surface="mutedSection"
          trimBottom
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
            size="xs"
          >
            {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
          </Badge>
        </CardHeader>
        <CardContent spacing="section" padding="inset" className="space-y-4">
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
            <Label className="text-sm font-bold uppercase  text-muted-foreground">
              Emergency Contact
            </Label>
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
          density="compact"
          layout="rowBetweenResponsive"
          surface="mutedSection"
          trimBottom
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
        <CardContent spacing="section" padding="inset" className="space-y-4">
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
