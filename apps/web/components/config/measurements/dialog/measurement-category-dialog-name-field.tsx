import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-bold uppercase  text-muted-foreground">
            Category Name
          </FormLabel>
          <FormControl>
            <Input placeholder="e.g. Mens Shirt" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
