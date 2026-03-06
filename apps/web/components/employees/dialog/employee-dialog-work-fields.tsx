import type { UseFormReturn } from "react-hook-form";
import { EMPLOYEE_STATUS_LABELS, PAYMENT_TYPE_LABELS } from "@tbms/shared-constants";
import { EmployeeStatus, PaymentType } from "@tbms/shared-types";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

export function EmployeeDialogWorkFields({ form }: EmployeeDialogWorkFieldsProps) {
  const selectedPaymentType = form.watch("paymentType");
  const selectedStatus = form.watch("status");

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Designation</FormLabel>
              <FormControl>
                <Input variant="premium" placeholder="e.g. Master Tailor" {...field} />
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
              <FormLabel variant="dashboard">Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger variant="premium">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Payment Model</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger variant="premium">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
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
              <FormLabel variant="dashboard">Date of Joining</FormLabel>
              <FormControl>
                <Input variant="premium" type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {selectedPaymentType === PaymentType.MONTHLY_FIXED ? (
        <FormField
          control={form.control}
          name="monthlySalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Monthly Salary (Rs.)</FormLabel>
              <FormControl>
                <Input
                  variant="premium"
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
              <FormLabel variant="dashboard">Employment End Date</FormLabel>
              <FormControl>
                <Input variant="premium" type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </>
  );
}
