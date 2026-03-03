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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="tableIcon" size="iconSm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 shadow-sm">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {employee.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Typography as="h1" variant="sectionTitle" className="text-2xl">
              {employee.fullName}
            </Typography>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="info" className="font-bold tracking-tight">
                {employee.employeeCode}
              </Badge>
              <span>•</span>
              <span>{employee.designation}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!employee.userAccount ? (
          <Button variant="outline" size="sm" onClick={onProvisionAccount}>
            <UserPlus className="mr-2 h-4 w-4" /> Provision Account
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={onEditProfile}>
          <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>
    </div>
  );
}
