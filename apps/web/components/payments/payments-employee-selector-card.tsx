import { UserRound } from "lucide-react";
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
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">Employee Scope</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Select an employee to load payroll summary and ledger.
            </p>
          </div>
        </div>
        <Badge variant="secondary" size="xs">
          {employees.length} employees
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4">
        <div className="max-w-xl space-y-2">
          <Label variant="dashboard">Select Tailor / Staff</Label>
          <Select
            value={selectedEmployeeId}
            onValueChange={onEmployeeChange}
            disabled={loading}
          >
            <SelectTrigger variant="table" className="h-10">
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
        </div>

        {selectedEmployee ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
              <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Employee</Label>
              <Typography as="p" variant="body" className="mt-1 font-semibold">
                {selectedEmployee.fullName}
              </Typography>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
              <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Code</Label>
              <Typography as="p" variant="body" className="mt-1 font-semibold">
                {selectedEmployee.employeeCode}
              </Typography>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
              <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Role</Label>
              <Typography as="p" variant="body" className="mt-1 font-semibold">
                {selectedEmployee.designation || "Staff"}
              </Typography>
            </div>
          </div>
        ) : (
          <Typography as="p" variant="muted">
            No employee selected yet.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
