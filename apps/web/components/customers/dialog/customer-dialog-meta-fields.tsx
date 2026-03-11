import type { UseFormReturn } from "react-hook-form";
import { CustomerStatus } from "@tbms/shared-types";
import { CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
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
import { type CustomerFormValues } from "@/types/customers";

interface CustomerDialogMetaFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function CustomerDialogMetaFields({
  form,
}: CustomerDialogMetaFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (opt.)</FormLabel>
            <FormControl>
              <Input placeholder="john@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormGrid columns="two" className="gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Lahore" {...field} />
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
                  {Object.values(CustomerStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {CUSTOMER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
    </>
  );
}
