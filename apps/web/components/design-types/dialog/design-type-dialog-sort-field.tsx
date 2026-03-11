import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { type DesignTypeFormValues } from "@/hooks/use-design-type-dialog";

interface DesignTypeDialogSortFieldProps {
  form: UseFormReturn<DesignTypeFormValues>;
}

export function DesignTypeDialogSortField({
  form,
}: DesignTypeDialogSortFieldProps) {
  return (
    <FormField
      control={form.control}
      name="sortOrder"
      render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
        <FormItem>
          <FormLabel>Sort Order</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
