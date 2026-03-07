import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
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
    <Card>
      <CardHeader layout="rowBetweenResponsive" surface="mutedSection" trimBottom>
        <SectionHeader
          title="Employee Scope"
          description="Select an employee to load payroll summary and ledger."
          icon={
            <SectionIcon size="lg">
              <UserRound className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge variant="default" size="xs">
          {employees.length} employees
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4">
        <div className="max-w-xl space-y-2">
          <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Select Tailor / Staff</Label>
          <Select
            value={selectedEmployeeId}
            onValueChange={onEmployeeChange}
            disabled={loading}
          >
            <SelectTrigger className="h-10">
              <SelectValue
                placeholder={
                  loading ? "Loading employees..." : "Choose an employee…"
                }
              />
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
            <InfoTile>
              <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Employee</Label>
              <Text as="p"  variant="body" className="mt-1 font-semibold">
                {selectedEmployee.fullName}
              </Text>
            </InfoTile>
            <InfoTile>
              <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Code</Label>
              <Text as="p"  variant="body" className="mt-1 font-semibold">
                {selectedEmployee.employeeCode}
              </Text>
            </InfoTile>
            <InfoTile>
              <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Role</Label>
              <Text as="p"  variant="body" className="mt-1 font-semibold">
                {selectedEmployee.designation || "Staff"}
              </Text>
            </InfoTile>
          </div>
        ) : (
          <Text as="p"  variant="muted">
            No employee selected yet.
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
