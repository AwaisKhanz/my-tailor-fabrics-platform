import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { type FieldFormValues } from "@/hooks/use-measurement-field-dialog";

interface MeasurementFieldDialogRequiredToggleProps {
  form: UseFormReturn<FieldFormValues>;
}

export function MeasurementFieldDialogRequiredToggle({
  form,
}: MeasurementFieldDialogRequiredToggleProps) {
  return (
    <FormField
      control={form.control}
      name="isRequired"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-0.5">
            <FormLabel variant="dashboard" className="cursor-pointer">
              Required Field
            </FormLabel>
            <Typography as="p" variant="muted">
              Make this field mandatory for orders
            </Typography>
          </div>
          <FormControl>
            <Switch variant="premium" checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
