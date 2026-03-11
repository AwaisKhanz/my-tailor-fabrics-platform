import type { UseFormReturn } from "react-hook-form";
import {
  EMPLOYEE_STATUS_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
} from "@tbms/shared-constants";
import { EmployeeStatus, PaymentType } from "@tbms/shared-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormGrid } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type EmployeeFormValues } from "@/types/employees";

interface EmployeeDialogWorkFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeDialogWorkFields({
  form,
}: EmployeeDialogWorkFieldsProps) {
  const selectedPaymentType = form.watch("paymentType");
  const selectedStatus = form.watch("status");

  return (
    <>
      <FormGrid columns="two" className="gap-4">
        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Master Tailor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>

      <FormGrid columns="two" className="gap-4">
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Model</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfJoining"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Joining</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>

      {selectedPaymentType === PaymentType.MONTHLY_FIXED ? (
        <FormField
          control={form.control}
          name="monthlySalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Salary (Rs.)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 45000"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      {selectedStatus === EmployeeStatus.LEFT ? (
        <FormField
          control={form.control}
          name="employmentEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </>
  );
}
