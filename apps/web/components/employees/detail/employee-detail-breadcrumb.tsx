import { ChevronRight } from "lucide-react";

interface EmployeeDetailBreadcrumbProps {
  employeeCode: string;
  onBack: () => void;
}

export function EmployeeDetailBreadcrumb({
  employeeCode,
  onBack,
}: EmployeeDetailBreadcrumbProps) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
      <button
        type="button"
        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onBack}
      >
        Employees
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-foreground">{employeeCode}</span>
    </div>
  );
}
