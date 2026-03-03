import { ArrowLeft, Edit2, UserPlus } from "lucide-react";
import type { EmployeeWithRelations } from "@/lib/api/employees";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface EmployeeDetailHeaderProps {
  employee: EmployeeWithRelations;
  onBack: () => void;
  onProvisionAccount: () => void;
  onEditProfile: () => void;
}

export function EmployeeDetailHeader({
  employee,
  onBack,
  onProvisionAccount,
  onEditProfile,
}: EmployeeDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <Button variant="tableIcon" size="iconSm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-14 w-14 border-2 shadow-sm">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {employee.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <Typography as="h1" variant="sectionTitle" className="truncate text-2xl">
              {employee.fullName}
            </Typography>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="info" className="font-bold tracking-tight">
                {employee.employeeCode}
              </Badge>
              <span className="hidden sm:inline">•</span>
              <span className="font-medium">{employee.designation}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-2 sm:w-auto xl:justify-end">
        {!employee.userAccount ? (
          <Button variant="outline" size="sm" onClick={onProvisionAccount} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" /> Provision Account
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={onEditProfile} className="w-full sm:w-auto">
          <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>
    </div>
  );
}
