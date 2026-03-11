import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { FormGrid } from "@tbms/ui/components/form-layout";
import { Input } from "@tbms/ui/components/input";
import { PRIMARY_PHONE_PLACEHOLDER } from "@/lib/form-placeholders";
import { type CustomerFormValues } from "@/types/customers";

interface CustomerDialogPrimaryFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function CustomerDialogPrimaryFields({
  form,
}: CustomerDialogPrimaryFieldsProps) {
  return (
    <FormGrid columns="two" className="gap-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem className="col-span-2">
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
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder={PRIMARY_PHONE_PLACEHOLDER} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whatsapp"
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem>
            <FormLabel>WhatsApp (opt.)</FormLabel>
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
