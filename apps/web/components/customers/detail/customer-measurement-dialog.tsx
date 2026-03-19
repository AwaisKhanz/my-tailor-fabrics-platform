import { MeasurementForm } from "@/components/customers/MeasurementForm";
import { type CustomerMeasurement, type MeasurementValues } from "@tbms/shared-types";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";

interface CustomerMeasurementDialogProps {
  open: boolean;
  customerId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialCategoryId?: string;
  initialValues?: MeasurementValues;
  measurements?: CustomerMeasurement[];
}

export function CustomerMeasurementDialog({
  open,
  customerId,
  onOpenChange,
  onSuccess,
  initialCategoryId,
  initialValues,
  measurements,
}: CustomerMeasurementDialogProps) {
  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update Body Measurements"
      contentSize="2xl"
      maxWidthClass="sm:max-w-[700px]"
      maxHeightClass="max-h-[90vh]"
    >
      <MeasurementForm
        open={open}
        customerId={customerId}
        onSuccess={onSuccess}
        initialCategoryId={initialCategoryId}
        initialValues={initialValues}
        measurements={measurements}
      />
    </ScrollableDialog>
  );
}
