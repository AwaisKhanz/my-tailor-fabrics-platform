"use client";

import type { EmployeeWithRelations } from "@tbms/shared-types";
import { EmployeeDocumentsSection } from "@/components/employees/detail/employee-documents-section";
import { EmployeeAccountSection } from "@/components/employees/detail/employee-account-section";

interface EmployeeAdminTabProps {
  employee: EmployeeWithRelations;
  canManageDocuments: boolean;
  canManageAccount: boolean;
  onOpenDocumentDialog: () => void;
  onOpenAccountDialog: () => void;
}

export function EmployeeAdminTab({
  employee,
  canManageDocuments,
  canManageAccount,
  onOpenDocumentDialog,
  onOpenAccountDialog,
}: EmployeeAdminTabProps) {
  return (
    <div className="space-y-6">
      <EmployeeDocumentsSection
        documents={employee.documents}
        canManageDocuments={canManageDocuments}
        onOpenDocumentDialog={onOpenDocumentDialog}
      />

      <EmployeeAccountSection
        employee={employee}
        canManageAccount={canManageAccount}
        onOpenAccountDialog={onOpenAccountDialog}
      />
    </div>
  );
}
