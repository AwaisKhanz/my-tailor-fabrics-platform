import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { type FieldFormValues } from "@/hooks/use-measurement-field-dialog";

interface MeasurementFieldDialogBasicFieldsProps {
  form: UseFormReturn<FieldFormValues>;
}

export function MeasurementFieldDialogBasicFields({
  form,
}: MeasurementFieldDialogBasicFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="label"
        rules={{ required: "Label is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Label</FormLabel>
            <FormControl>
              <Input variant="premium" placeholder="e.g., Shoulder, Chest, Collar" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fieldType"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Field Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger variant="premium">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NUMBER">Number</SelectItem>
                  <SelectItem value="TEXT">Short Text</SelectItem>
                  <SelectItem value="DROPDOWN">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Unit</FormLabel>
              <FormControl>
                <Input variant="premium" placeholder="e.g., inches, cm" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
