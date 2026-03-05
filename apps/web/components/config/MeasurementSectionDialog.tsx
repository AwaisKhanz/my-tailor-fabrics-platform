"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  onSuccess: () => void;
}

export function MeasurementSectionDialog({
  open,
  onOpenChange,
  categoryId,
  onSuccess,
}: MeasurementSectionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<MeasurementSectionDialogFormValues>({
    resolver: typedZodResolver<MeasurementSectionDialogFormValues>(measurementSectionDialogFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({ name: "" });
  }, [form, open]);

  const submitSection = useCallback(
    async (values: MeasurementSectionDialogFormValues) => {
      setLoading(true);
      try {
        await configApi.addMeasurementSection(categoryId, {
          name: values.name,
        });
        toast({ title: "Section added successfully" });
        onSuccess();
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(error, "Failed to add section. Please try again."),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [categoryId, onOpenChange, onSuccess, toast],
  );

  const submitForm = form.handleSubmit(submitSection);

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="measurement-section-form"
      submitText="Add Section"
      submitting={loading}
      cancelVariant="outline"
      submittingText="Adding Section..."
      submitClassName="min-w-[130px]"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Measurement Section"
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
                <FormLabel variant="dashboard">Section Name</FormLabel>
                <FormControl>
                  <Input
                    variant="premium"
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
