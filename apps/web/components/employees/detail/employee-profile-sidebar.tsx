import { BriefcaseBusiness, MapPin, Phone, UserSquare2 } from "lucide-react";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface EmployeeProfileSidebarProps {
  employee: EmployeeWithRelations;
}

export function EmployeeProfileSidebar({
  employee,
}: EmployeeProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <Card variant="elevatedPanel">
        <CardHeader
          variant="rowSection"
          density="compact"
          align="startResponsive"
        >
          <div className="flex items-center gap-2">
            <SectionIcon tone="infoSoft">
              <UserSquare2 className="h-4 w-4" />
            </SectionIcon>
            <CardTitle variant="section">Personal Info</CardTitle>
          </div>
          <Badge
            variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"}
            size="xs"
          >
            {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
          </Badge>
        </CardHeader>
        <CardContent spacing="section" padding="inset" className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-text-secondary" />
            <span className="font-medium text-text-primary">
              {employee.phone}
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm text-text-secondary">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{employee.address || "No address provided"}</span>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label variant="dashboard">Emergency Contact</Label>
            <div>
              <p className="text-sm font-bold">
                {employee.emergencyName || "Not set"}
              </p>
              <p className="text-xs text-text-secondary">
                {employee.emergencyPhone || "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevatedPanel">
        <CardHeader
          variant="rowSection"
          density="compact"
          align="startResponsive"
        >
          <div className="flex items-center gap-2">
            <SectionIcon tone="infoSoft">
              <BriefcaseBusiness className="h-4 w-4" />
            </SectionIcon>
            <CardTitle variant="section">Employment</CardTitle>
          </div>
        </CardHeader>
        <CardContent spacing="section" padding="inset" className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Join Date</span>
            <span className="font-medium">
              {formatDate(employee.dateOfJoining)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Pay Model</span>
            <Badge variant="outline" className="text-[10px]">
              {PAYMENT_TYPE_LABELS[employee.paymentType] ??
                employee.paymentType}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Designation</span>
            <span className="font-medium">
              {employee.designation || "Staff"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
