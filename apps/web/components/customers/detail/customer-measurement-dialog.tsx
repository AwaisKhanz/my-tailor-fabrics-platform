import { MeasurementForm } from "@/components/customers/MeasurementForm";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";

interface CustomerMeasurementDialogProps {
  open: boolean;
  customerId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CustomerMeasurementDialog({
  open,
  customerId,
  onOpenChange,
  onSuccess,
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
      <MeasurementForm customerId={customerId} onSuccess={onSuccess} />
    </ScrollableDialog>
  );
}
