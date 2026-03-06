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
          <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Sort Order</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
