"use client";

import { Clock3, UserCheck } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { FieldError, FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { FormGrid } from "@tbms/ui/components/form-layout";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import type {
  ClockInFieldErrors,
  EmployeeOption,
} from "@/hooks/use-attendance-settings-page";

interface AttendanceQuickClockInCardProps {
  employeesLoading: boolean;
  activeEmployeeOptions: EmployeeOption[];
  clockInEmployeeId: string;
  clockInNote: string;
  clockingIn: boolean;
  clockInFieldErrors: ClockInFieldErrors;
  clockInValidationError: string;
  setClockInEmployeeId: (value: string) => void;
  setClockInNote: (value: string) => void;
  clockIn: () => Promise<void>;
}

export function AttendanceQuickClockInCard({
  employeesLoading,
  activeEmployeeOptions,
  clockInEmployeeId,
  clockInNote,
  clockingIn,
  clockInFieldErrors,
  clockInValidationError,
  setClockInEmployeeId,
  setClockInNote,
  clockIn,
}: AttendanceQuickClockInCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-4 w-4" />
          Quick Clock-In
        </CardTitle>
        <CardDescription>
          Record an employee shift start directly from admin settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormGrid columns="three" className="items-end">
          <FieldStack>
            <FieldLabel size="compact">Employee</FieldLabel>
            <Select
              value={clockInEmployeeId}
              onValueChange={(value) => setClockInEmployeeId(value ?? "")}
              disabled={employeesLoading || clockingIn}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    employeesLoading ? "Loading employees..." : "Select employee"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activeEmployeeOptions.map((employee) => (
                  <SelectItem key={employee.value} value={employee.value}>
                    {employee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clockInFieldErrors.employeeId ? (
              <FieldError>{clockInFieldErrors.employeeId}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack>
            <FieldLabel size="compact">Note (Optional)</FieldLabel>
            <Input
              placeholder="Shift note or context..."
              value={clockInNote}
              onChange={(event) => setClockInNote(event.target.value)}
              disabled={clockingIn}
            />
            {clockInFieldErrors.note ? (
              <FieldError>{clockInFieldErrors.note}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack>
            <FieldLabel as="span" size="compact">
              Action
            </FieldLabel>
            <Button
              type="button"
              variant="default"
              disabled={clockingIn || !clockInEmployeeId}
              onClick={() => void clockIn()}
              className="w-full"
            >
              <Clock3 className="h-4 w-4" />
              {clockingIn ? "Clocking In..." : "Clock In"}
            </Button>
          </FieldStack>
        </FormGrid>

        {clockInValidationError ? (
          <FieldError className="mt-3">{clockInValidationError}</FieldError>
        ) : null}
      </CardContent>
    </Card>
  );
}
