import { UserRound } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { FormGrid } from "@tbms/ui/components/form-layout";
import { InfoTile } from "@tbms/ui/components/info-tile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { Text } from "@tbms/ui/components/typography";
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          Employee Scope
        </CardTitle>
        <CardDescription>
          Select an employee to load payroll summary and ledger.
        </CardDescription>
        <Badge variant="secondary">{employees.length} employees</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <FieldStack className="max-w-xl">
          <FieldLabel>Select Tailor / Staff</FieldLabel>
          <Select
            value={selectedEmployeeId}
            onValueChange={(value) => onEmployeeChange(value ?? "")}
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
        </FieldStack>

        {selectedEmployee ? (
          <FormGrid columns="three">
            <InfoTile tone="secondary" padding="content" className="space-y-1">
              <FieldLabel as="span" size="compact" block>
                Employee
              </FieldLabel>
              <Text className="text-sm font-semibold">
                {selectedEmployee.fullName}
              </Text>
            </InfoTile>
            <InfoTile tone="secondary" padding="content" className="space-y-1">
              <FieldLabel as="span" size="compact" block>
                Code
              </FieldLabel>
              <Text className="text-sm font-semibold">
                {selectedEmployee.employeeCode}
              </Text>
            </InfoTile>
            <InfoTile tone="secondary" padding="content" className="space-y-1">
              <FieldLabel as="span" size="compact" block>
                Role
              </FieldLabel>
              <Text className="text-sm font-semibold">
                {selectedEmployee.designation || "Staff"}
              </Text>
            </InfoTile>
          </FormGrid>
        ) : (
          <Text variant="muted">No employee selected yet.</Text>
        )}
      </CardContent>
    </Card>
  );
}
