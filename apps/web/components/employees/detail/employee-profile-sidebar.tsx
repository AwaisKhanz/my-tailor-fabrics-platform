import { BriefcaseBusiness, MapPin, Phone, UserSquare2 } from "lucide-react";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { EMPLOYEE_STATUS_BADGE, EMPLOYEE_STATUS_LABELS, PAYMENT_TYPE_LABELS } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface EmployeeProfileSidebarProps {
  employee: EmployeeWithRelations;
}

export function EmployeeProfileSidebar({ employee }: EmployeeProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95">
        <CardHeader variant="rowSection" density="compact" className="items-start sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <UserSquare2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">Personal Info</CardTitle>
          </div>
          <Badge variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"} size="xs">
            {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
          </Badge>
        </CardHeader>
        <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{employee.phone}</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{employee.address || "No address provided"}</span>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label variant="dashboard">Emergency Contact</Label>
            <div>
              <p className="text-sm font-bold">{employee.emergencyName || "Not set"}</p>
              <p className="text-xs text-muted-foreground">{employee.emergencyPhone || "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95">
        <CardHeader variant="rowSection" density="compact" className="items-start sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info ring-1 ring-info/20">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">Employment</CardTitle>
          </div>
        </CardHeader>
        <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Join Date</span>
            <span className="font-medium">{formatDate(employee.dateOfJoining)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pay Model</span>
            <Badge variant="outline" className="text-[10px]">
              {PAYMENT_TYPE_LABELS[employee.paymentType] ?? employee.paymentType}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Designation</span>
            <span className="font-medium">{employee.designation || "Staff"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
