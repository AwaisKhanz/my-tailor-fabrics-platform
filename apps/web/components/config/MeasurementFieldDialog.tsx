"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { MeasurementField } from "@/types/config";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";

interface MeasurementFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName?: string;
  initialData?: Partial<MeasurementField> | null;
  existingFields?: MeasurementField[];
  onSuccess: () => void;
}

interface FieldFormValues {
  label: string;
  fieldType: string;
  unit: string;
  isRequired: boolean;
  dropdownOptions: string[];
  sortOrder: number;
}

export function MeasurementFieldDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  initialData,
  existingFields = [],
  onSuccess,
}: MeasurementFieldDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newOption, setNewOption] = useState("");

  const form = useForm<FieldFormValues>({
    defaultValues: {
      label: "",
      fieldType: "NUMBER",
      unit: "",
      isRequired: false,
      dropdownOptions: [],
      sortOrder: 1,
    },
  });

  const fieldType = form.watch("fieldType");
  const dropdownOptions = form.watch("dropdownOptions");

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          label: initialData.label ?? "",
          fieldType: initialData.fieldType ?? "NUMBER",
          unit: initialData.unit ?? "",
          isRequired: initialData.isRequired ?? false,
          dropdownOptions: initialData.dropdownOptions ?? [],
          sortOrder: initialData.sortOrder ?? 1,
        });
      } else {
        form.reset({
          label: "",
          fieldType: "NUMBER",
          unit: "",
          isRequired: false,
          dropdownOptions: [],
          sortOrder: (existingFields.length ?? 0) + 1,
        });
      }
      setNewOption("");
    }
  }, [initialData, form, open, existingFields.length]);

  async function onSubmit(values: FieldFormValues) {
    const isDuplicate = existingFields.some(
      (f) =>
        f.label.toLowerCase() === values.label.toLowerCase() &&
        f.id !== initialData?.id
    );

    if (isDuplicate) {
      form.setError("label", {
        type: "manual",
        message: "A field with this name already exists in this category.",
      });
      return;
    }

    if (values.fieldType === "DROPDOWN" && values.dropdownOptions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one dropdown option.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        fieldType: values.fieldType as "NUMBER" | "TEXT" | "DROPDOWN",
        unit: values.unit || undefined,
        dropdownOptions:
          values.fieldType === "DROPDOWN" ? values.dropdownOptions : undefined,
      } as Partial<MeasurementField>;

      if (initialData?.id) {
        await configApi.updateMeasurementField(initialData.id, payload);
        toast({ title: "Field updated successfully" });
      } else {
        await configApi.addMeasurementField(categoryId, payload);
        toast({ title: "Field added successfully" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message || "Failed to save field. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    const current = form.getValues("dropdownOptions");
    if (!current.includes(trimmed)) {
      form.setValue("dropdownOptions", [...current, trimmed]);
    }
    setNewOption("");
  };

  const removeOption = (opt: string) => {
    const current = form.getValues("dropdownOptions");
    form.setValue(
      "dropdownOptions",
      current.filter((o) => o !== opt)
    );
  };

  const footerActions = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="measurement-field-form"
        disabled={loading}
        variant="premium"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        {initialData ? "Save Changes" : "Add Field"}
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Measurement Field" : "Add Measurement Field"}
      footerActions={footerActions}
    >
      {/* Category name shown as part of description inline */}
      {categoryName && (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          Define a new measurement unit for{" "}
          <span className="text-primary font-semibold">{categoryName}</span>
        </p>
      )}

      <Form {...form}>
        <form
          id="measurement-field-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Label */}
          <FormField
            control={form.control}
            name="label"
            rules={{ required: "Label is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input variant="premium" placeholder="e.g., Shoulder, Chest, Collar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field Type + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fieldType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Type</FormLabel>
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
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input variant="premium" placeholder="e.g., inches, cm" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>


          {/* Dropdown Options — only when fieldType === DROPDOWN */}
          {fieldType === "DROPDOWN" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  Dropdown Options
                </label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Manage Options
                </span>
              </div>

              <div className="rounded-md border bg-muted/50 p-3 min-h-[80px]">
                <div className="flex flex-wrap gap-2">
                  {/* Existing option chips */}
                  {dropdownOptions.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1 text-sm font-medium text-foreground shadow-sm"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => removeOption(opt)}
                        className="ml-0.5 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {/* Inline add: dashed button that becomes input on click */}
                  <AddOptionInline
                    value={newOption}
                    onChange={setNewOption}
                    onAdd={addOption}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Required Field */}
          <FormField
            control={form.control}
            name="isRequired"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold cursor-pointer">
                    Required Field
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Make this field mandatory for orders
                  </p>
                </div>
                <FormControl>
                  <Switch
                    variant="premium"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ScrollableDialog>
  );
}

/** Small inline component for adding dropdown options with a dashed button UX */
function AddOptionInline({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          className="w-28 rounded border border-primary/50 bg-background px-2 py-1 text-sm outline-none ring-1 ring-primary/20"
          placeholder="Option name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
              setEditing(false);
            }
            if (e.key === "Escape") {
              setEditing(false);
              onChange("");
            }
          }}
          onBlur={() => {
            onAdd();
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
    >
      <Plus className="h-3 w-3" />
      Add Option
    </button>
  );
}
