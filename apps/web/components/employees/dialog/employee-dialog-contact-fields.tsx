import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/typography";
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
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-bold uppercase  text-muted-foreground">
              Residential Address
            </FormLabel>
            <FormControl>
              <Input placeholder="Street, Area..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="emergencyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold uppercase  text-muted-foreground">
                Emergency Contact
              </FormLabel>
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
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold uppercase  text-muted-foreground">
                Emergency Phone
              </FormLabel>
              <FormControl>
                <Input placeholder="03XXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormStack>
  );
}
