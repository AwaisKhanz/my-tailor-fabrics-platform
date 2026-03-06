import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type CustomerFormValues } from "@/types/customers";

interface CustomerDialogAddressFieldProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function CustomerDialogAddressField({ form }: CustomerDialogAddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Address</FormLabel>
          <FormControl>
            <Input placeholder="Street, Area..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
