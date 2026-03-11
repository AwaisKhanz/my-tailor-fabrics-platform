import { EntityBreadcrumb } from "@tbms/ui/components/entity-breadcrumb";

interface EmployeeDetailBreadcrumbProps {
  employeeCode: string;
  onBack: () => void;
}

export function EmployeeDetailBreadcrumb({
  employeeCode,
  onBack,
}: EmployeeDetailBreadcrumbProps) {
  return <EntityBreadcrumb sectionLabel="Employees" currentLabel={employeeCode} onBack={onBack} />;
}
