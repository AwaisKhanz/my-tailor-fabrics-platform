import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { type MeasurementSection } from "@tbms/shared-types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormGrid } from "@/components/ui/form-layout";
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
  existingSections: MeasurementSection[];
}

export function MeasurementFieldDialogBasicFields({
  form,
  existingSections,
}: MeasurementFieldDialogBasicFieldsProps) {
  const sortedSections = useMemo(
    () =>
      [...existingSections].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        return left.name.localeCompare(right.name);
      }),
    [existingSections],
  );

  const NEW_SECTION_VALUE = "__new_section__";

  return (
    <>
      <FormField
        control={form.control}
        name="label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Shoulder, Chest, Collar" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sectionName"
        render={({ field }) => {
          const normalizedCurrentValue = (field.value ?? "")
            .trim()
            .toLowerCase();
          const matchingSection = sortedSections.find(
            (section) =>
              section.name.trim().toLowerCase() === normalizedCurrentValue,
          );
          const isCustomSection =
            sortedSections.length === 0 || !Boolean(matchingSection);

          return (
            <FormItem>
              <FormLabel>Section</FormLabel>
              <div className="space-y-3">
                <Select
                  value={matchingSection?.id ?? NEW_SECTION_VALUE}
                  onValueChange={(value) => {
                    if (value === NEW_SECTION_VALUE) {
                      if (matchingSection) {
                        field.onChange("");
                      }
                      return;
                    }

                    const selectedSection = sortedSections.find(
                      (section) => section.id === value,
                    );
                    if (selectedSection) {
                      field.onChange(selectedSection.name);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sortedSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_SECTION_VALUE}>
                      + Create New Section
                    </SelectItem>
                  </SelectContent>
                </Select>

                {isCustomSection ? (
                  <FormControl>
                    <Input placeholder="Type a new section name" {...field} />
                  </FormControl>
                ) : null}
              </div>
              <FormDescription>
                Select a section for this field, or create a new section name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />
        <FormGrid columns="two" className="gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fieldType"
          render={({ field }) => (
                <FormLabel>Field Type</FormLabel>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
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
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input placeholder="e.g., inches, cm" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </FormGrid>
    </>
  );
}
