import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { FormGrid, FormStack } from "@tbms/ui/components/form-layout";
import { Input } from "@tbms/ui/components/input";
import { Heading } from "@tbms/ui/components/typography";
import { PRIMARY_PHONE_PLACEHOLDER } from "@/lib/form-placeholders";
import { type EmployeeFormValues } from "@/types/employees";

interface EmployeeDialogContactFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeDialogContactFields({
  form,
}: EmployeeDialogContactFieldsProps) {
  return (
    <FormStack className="border-t pt-4">
      <Heading
        as="h3"
        variant="section"
        className="text-sm uppercase  text-muted-foreground"
      >
        Personal &amp; Emergency Details
      </Heading>

      <FormField
        control={form.control}
        name="address"
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem>
            <FormLabel>Residential Address</FormLabel>
            <FormControl>
              <Input placeholder="Street, Area..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormGrid columns="two" className="gap-4">
        <FormField
          control={form.control}
          name="emergencyName"
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem>
              <FormLabel>Emergency Contact</FormLabel>
              <FormControl>
                <Input placeholder="Contact name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyPhone"
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem>
              <FormLabel>Emergency Phone</FormLabel>
              <FormControl>
                <Input placeholder={PRIMARY_PHONE_PLACEHOLDER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
    </FormStack>
  );
}
