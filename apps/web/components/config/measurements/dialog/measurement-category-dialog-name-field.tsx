import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { type MeasurementCategoryFormValues } from "@/types/config";

interface MeasurementCategoryDialogNameFieldProps {
  form: UseFormReturn<MeasurementCategoryFormValues>;
}

export function MeasurementCategoryDialogNameField({
  form,
}: MeasurementCategoryDialogNameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
        <FormItem>
          <FormLabel>Category Name</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Mens Shirt" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
