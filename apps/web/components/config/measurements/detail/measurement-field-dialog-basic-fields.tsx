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
  existingSectionNames: string[];
}

export function MeasurementFieldDialogBasicFields({
  form,
  existingSectionNames,
}: MeasurementFieldDialogBasicFieldsProps) {
  const sectionSuggestions = Array.from(
    new Set(existingSectionNames.map((name) => name.trim()).filter(Boolean)),
  );

  return (
    <>
      <FormField
        control={form.control}
        name="label"
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

      <FormField
        control={form.control}
        name="sectionName"
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Section</FormLabel>
            <FormControl>
              <Input
                variant="premium"
                placeholder="e.g., Upper Body, Bottom, Extras"
                list="measurement-section-suggestions"
                {...field}
              />
            </FormControl>
            {sectionSuggestions.length > 0 ? (
              <datalist id="measurement-section-suggestions">
                {sectionSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            ) : null}
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
