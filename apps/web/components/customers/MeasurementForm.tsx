"use client";

import {
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
} from "@/components/ui/form";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormActionRow, FormStack } from "@/components/ui/form-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { useMeasurementForm } from "@/hooks/use-measurement-form";

interface MeasurementFormProps {
  customerId: string;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialValues?: MeasurementValues;
}

export function MeasurementForm({
  customerId,
  onSuccess,
  initialCategoryId,
  initialValues,
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
    customerId,
    onSuccess,
    initialCategoryId,
    initialValues,
  });

  if (loading)
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <FormStack density="relaxed">
      <div className="space-y-2">
        <FieldLabel>Measurement Category</FieldLabel>
        <Select
          onValueChange={handleCategoryChange}
          defaultValue={initialCategoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Garment Category" />
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
                          render={({ field: formField }) => (
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
                                    onValueChange={formField.onChange}
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
