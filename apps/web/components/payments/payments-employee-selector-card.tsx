import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { type Employee } from "@/types/employees";

interface PaymentsEmployeeSelectorCardProps {
  employees: Employee[];
  loading: boolean;
  selectedEmployeeId: string;
  selectedEmployee: Employee | null;
  onEmployeeChange: (employeeId: string) => void;
}

export function PaymentsEmployeeSelectorCard({
  employees,
  loading,
  selectedEmployeeId,
  selectedEmployee,
  onEmployeeChange,
}: PaymentsEmployeeSelectorCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle variant="dashboard">Active Selection</CardTitle>
          <Badge variant="secondary" size="xs">
            {employees.length} employees
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="max-w-xl space-y-2">
          <Label variant="dashboard">Select Tailor / Staff</Label>
          <Select
            value={selectedEmployeeId}
            onValueChange={onEmployeeChange}
            disabled={loading}
          >
            <SelectTrigger variant="premium" className="h-11">
              <SelectValue placeholder={loading ? "Loading employees..." : "Choose an employee…"} />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.fullName}
                  <span className="ml-1 text-muted-foreground opacity-60">
                    ({employee.employeeCode})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEmployee ? (
            <Typography as="p" variant="muted" className="pt-1">
              Viewing ledger for {selectedEmployee.fullName} ({selectedEmployee.employeeCode})
            </Typography>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
