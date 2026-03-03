import { MeasurementForm } from "@/components/customers/MeasurementForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogSection } from "@/components/ui/form-layout";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Update Body Measurements</DialogTitle>
        </DialogHeader>

        <DialogSection className="flex-1 overflow-y-auto p-1">
          <MeasurementForm customerId={customerId} onSuccess={onSuccess} />
        </DialogSection>
      </DialogContent>
    </Dialog>
  );
}
