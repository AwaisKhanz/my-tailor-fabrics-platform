import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type DesignTypeFormValues } from "@/hooks/use-design-type-dialog";

interface DesignTypeDialogSortFieldProps {
  form: UseFormReturn<DesignTypeFormValues>;
}

export function DesignTypeDialogSortField({ form }: DesignTypeDialogSortFieldProps) {
  return (
    <FormField
      control={form.control}
      name="sortOrder"
      render={({ field }) => (
        <FormItem>
          <FormLabel variant="dashboard">Sort Order</FormLabel>
          <FormControl>
            <Input variant="premium" type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
