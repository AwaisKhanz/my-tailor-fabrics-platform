import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type CustomerFormValues } from "@/types/customers";

interface CustomerDialogPrimaryFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function CustomerDialogPrimaryFields({ form }: CustomerDialogPrimaryFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Full Name</FormLabel>
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
            <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Phone</FormLabel>
            <FormControl>
              <Input placeholder="03XXXXXXXXX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whatsapp"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">WhatsApp (opt.)</FormLabel>
            <FormControl>
              <Input placeholder="03XXXXXXXXX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
