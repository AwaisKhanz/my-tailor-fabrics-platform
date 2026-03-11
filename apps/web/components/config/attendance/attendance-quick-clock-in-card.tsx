"use client";

import { Clock3, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
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
      <CardHeader surface="mutedSection" trimBottom>
        <SectionHeader
          title="Quick Clock-In"
          description="Record an employee shift start directly from admin settings."
          icon={
            <SectionIcon size="sm">
              <UserCheck className="h-4 w-4" />
            </SectionIcon>
          }
        />
      </CardHeader>
      <CardContent
        spacing="section"
        className="grid gap-3 p-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)_auto] md:items-end"
      >
        <div className="space-y-2">
          <FieldLabel size="compact">Employee</FieldLabel>
          <Select
            value={clockInEmployeeId}
            onValueChange={setClockInEmployeeId}
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
        </div>

        <div className="space-y-2">
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
        </div>

        <Button
          type="button"
          variant="default"
          disabled={clockingIn || !clockInEmployeeId}
          onClick={() => void clockIn()}
          className="w-full md:w-auto"
        >
          <Clock3 className="h-4 w-4" />
          {clockingIn ? "Clocking In..." : "Clock In"}
        </Button>
        {clockInValidationError ? (
          <FieldError size="sm" className="md:col-span-3">
            {clockInValidationError}
          </FieldError>
        ) : null}
      </CardContent>
    </Card>
  );
}
