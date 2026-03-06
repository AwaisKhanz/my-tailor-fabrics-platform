"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type MeasurementSection } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { typedZodResolver } from "@/lib/utils/form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";

const measurementSectionDialogFormSchema = z.object({
  name: z.string().trim().min(1, "Section name is required"),
});

type MeasurementSectionDialogFormValues = z.infer<typeof measurementSectionDialogFormSchema>;

interface MeasurementSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  initialSection?: MeasurementSection | null;
  onSuccess: () => void;
}

export function MeasurementSectionDialog({
  open,
  onOpenChange,
  categoryId,
  initialSection,
  onSuccess,
}: MeasurementSectionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<MeasurementSectionDialogFormValues>({
    resolver: typedZodResolver(measurementSectionDialogFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({ name: initialSection?.name ?? "" });
  }, [form, initialSection?.name, open]);

  const submitSection = useCallback(
    async (values: MeasurementSectionDialogFormValues) => {
      setLoading(true);
      try {
        if (initialSection?.id) {
          await configApi.updateMeasurementSection(initialSection.id, {
            name: values.name,
          });
          toast({ title: "Section updated successfully" });
        } else {
          await configApi.addMeasurementSection(categoryId, {
            name: values.name,
          });
          toast({ title: "Section added successfully" });
        }
        onSuccess();
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            initialSection?.id
              ? "Failed to update section. Please try again."
              : "Failed to add section. Please try again.",
          ),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [categoryId, initialSection?.id, onOpenChange, onSuccess, toast],
  );

  const submitForm = form.handleSubmit(submitSection);

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="measurement-section-form"
      submitText={initialSection?.id ? "Save Section" : "Add Section"}
      submitting={loading}
      cancelVariant="outline"
      submittingText={initialSection?.id ? "Saving Section..." : "Adding Section..."}
      submitClassName="min-w-[130px]"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialSection?.id ? "Edit Measurement Section" : "Add Measurement Section"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-md"
    >
      <Form {...form}>
        <FormStack as="form" id="measurement-section-form" onSubmit={submitForm} density="relaxed">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Section Name</FormLabel>
                <FormControl>
                  <Input
                   
                    placeholder="e.g., Upper Body, Lower Body, Extras"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
