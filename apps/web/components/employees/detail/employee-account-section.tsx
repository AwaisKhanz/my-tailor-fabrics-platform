"use client";

import { ShieldCheck } from "lucide-react";
import type { EmployeeWithRelations } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { Heading } from "@tbms/ui/components/typography";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { SectionIcon } from "@tbms/ui/components/section-icon";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";

interface EmployeeAccountSectionProps {
  employee: EmployeeWithRelations;
  canManageAccount: boolean;
  onOpenAccountDialog: () => void;
}

export function EmployeeAccountSection({
  employee,
  canManageAccount,
  onOpenAccountDialog,
}: EmployeeAccountSectionProps) {
  return (
    <EmployeeSection
      id="employee-account"
      title="Portal Account"
      description="Provision and review employee login access to the system."
      badge={
        <Badge
          variant={employee.userAccount ? "default" : "outline"}

          className="font-semibold"
        >
          {employee.userAccount ? "ACTIVE" : "NOT PROVISIONED"}
        </Badge>
      }
      defaultOpen={false}
    >
      <div className="p-4 sm:p-5">
        {employee.userAccount ? (
          <Card className="bg-muted shadow-sm">
            <CardHeader>
              <SectionHeader
                title="System Access Enabled"
                titleClassName="text-sm"
                description="This employee has an active portal account."
                icon={
                  <SectionIcon tone="info" size="sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </SectionIcon>
                }
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-muted-foreground">Login Email</span>
                <span className="font-bold ">{employee.userAccount.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">
                  {employee.userAccount.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-5 py-10 text-center">
            <InfoTile
              tone="default"
              padding="none"
              className="rounded-full border-none p-4"
            >
              <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-30" />
            </InfoTile>
            <div>
              <Heading as="h3" variant="section">
                No Portal Account
              </Heading>
              <p className="mt-1 max-w-[300px] text-sm text-muted-foreground">
                Provision an account to allow order tracking access.
              </p>
            </div>
            {canManageAccount ? (
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={onOpenAccountDialog}
              >
                Provision Account Now
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </EmployeeSection>
  );
}
