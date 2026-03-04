import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { type EmployeeFormValues } from "@/types/employees";

interface EmployeeDialogContactFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeDialogContactFields({ form }: EmployeeDialogContactFieldsProps) {
  return (
    <FormStack className="border-t pt-4">
      <Typography as="h3" variant="sectionTitle" className="text-sm uppercase tracking-wide text-text-secondary">
        Personal &amp; Emergency Details
      </Typography>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Residential Address</FormLabel>
            <FormControl>
              <Input variant="premium" placeholder="Street, Area..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="emergencyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Emergency Contact</FormLabel>
              <FormControl>
                <Input variant="premium" placeholder="Contact name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Emergency Phone</FormLabel>
              <FormControl>
                <Input variant="premium" placeholder="03XXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormStack>
  );
}
