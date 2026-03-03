import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type EmployeeFormValues } from "@/types/employees";

interface EmployeeDialogPrimaryFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeDialogPrimaryFields({ form }: EmployeeDialogPrimaryFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Full Name</FormLabel>
            <FormControl>
              <Input variant="premium" placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Primary Phone</FormLabel>
            <FormControl>
              <Input variant="premium" placeholder="03XXXXXXXXX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
