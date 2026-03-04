import { EntityBreadcrumb } from "@/components/ui/entity-breadcrumb";

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
