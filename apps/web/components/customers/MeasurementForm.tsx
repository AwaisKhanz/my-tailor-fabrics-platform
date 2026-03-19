"use client";

import {
  type CustomerMeasurement,
  type MeasurementValues,
  FieldType,
} from "@tbms/shared-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { FieldLabel } from "@tbms/ui/components/field";
import { Input } from "@tbms/ui/components/input";
import { Button } from "@tbms/ui/components/button";
import { FormActionRow, FormStack } from "@tbms/ui/components/form-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { Card } from "@tbms/ui/components/card";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { useMeasurementForm } from "@/hooks/use-measurement-form";

interface MeasurementFormProps {
  open: boolean;
  customerId: string;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialValues?: MeasurementValues;
  measurements?: CustomerMeasurement[];
}

export function MeasurementForm({
  open,
  customerId,
  onSuccess,
  initialCategoryId,
  initialValues,
  measurements,
}: MeasurementFormProps) {
  const {
    form,
    categories,
    selectedCategory,
    loading,
    submitting,
    groupedFields,
    handleCategoryChange,
    onSubmit,
  } = useMeasurementForm({
    open,
    customerId,
    onSuccess,
    initialCategoryId,
    initialValues,
    measurements,
  });

  if (loading)
    return (
      <LoadingState
        text="Loading measurements..."
        caption="Fetching category fields."
        className="py-8"
      />
    );

  return (
    <FormStack density="relaxed">
      <div className="space-y-2">
        <FieldLabel>Measurement Category</FieldLabel>
        <Select
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            handleCategoryChange(value);
          }}
          value={selectedCategory?.id ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Garment Category">
              {selectedCategory?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <Card>
          <Form {...form}>
            <FormStack as="form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {groupedFields.map((section) => (
                  <div key={section.id} className="p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {section.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {section.fields.length} field
                        {section.fields.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {section.fields.map((field) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={field.id}
                          render={({ field: formField }: { field: import("react-hook-form").ControllerRenderProps }) => (
                            <FormItem>
                              <FormLabel>
                                {field.label}{" "}
                                {field.unit && (
                                  <span className="text-xs text-muted-foreground">
                                    ({field.unit})
                                  </span>
                                )}
                                {field.isRequired && (
                                  <span className="text-destructive">*</span>
                                )}
                              </FormLabel>
                              <FormControl>
                                {field.fieldType === FieldType.DROPDOWN ? (
                                  <Select
                                    onValueChange={(value) => {
                                      formField.onChange(value ?? "");
                                    }}
                                    value={
                                      typeof formField.value === "string"
                                        ? formField.value
                                        : ""
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={`Select ${field.label}`}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.dropdownOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    type={
                                      field.fieldType === FieldType.NUMBER
                                        ? "text"
                                        : "text"
                                    }
                                    {...formField}
                                    value={
                                      typeof formField.value === "string" ||
                                      typeof formField.value === "number"
                                        ? formField.value
                                        : ""
                                    }
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <FormActionRow>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Measurements"}
                </Button>
              </FormActionRow>
            </FormStack>
          </Form>
        </Card>
      )}
    </FormStack>
  );
}
