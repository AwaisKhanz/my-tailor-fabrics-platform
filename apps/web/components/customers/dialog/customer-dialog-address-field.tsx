import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { type CustomerFormValues } from "@/types/customers";

interface CustomerDialogAddressFieldProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function CustomerDialogAddressField({
  form,
}: CustomerDialogAddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
        <FormItem>
          <FormLabel>Address</FormLabel>
          <FormControl>
            <Input placeholder="Street, Area..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
