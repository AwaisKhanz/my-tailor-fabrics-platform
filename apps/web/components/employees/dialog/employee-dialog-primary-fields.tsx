import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormGrid } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { PRIMARY_PHONE_PLACEHOLDER } from "@/lib/form-placeholders";
import { type EmployeeFormValues } from "@/types/employees";

interface EmployeeDialogPrimaryFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeDialogPrimaryFields({
  form,
}: EmployeeDialogPrimaryFieldsProps) {
  return (
    <FormGrid columns="two" className="gap-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
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
            <FormLabel>Primary Phone</FormLabel>
            <FormControl>
              <Input placeholder={PRIMARY_PHONE_PLACEHOLDER} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormGrid>
  );
}
