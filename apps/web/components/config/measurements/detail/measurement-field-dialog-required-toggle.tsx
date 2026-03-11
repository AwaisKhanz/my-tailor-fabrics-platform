import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@tbms/ui/components/form";
import { Switch } from "@tbms/ui/components/switch";
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
      render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
        <FormItem className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-0.5">
            <FormLabel className="cursor-pointer">Required Field</FormLabel>
            <p className="text-sm text-muted-foreground">
              Make this field mandatory for orders
            </p>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
