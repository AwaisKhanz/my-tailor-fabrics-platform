import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogActionRow,
  DialogFormActions,
  DialogSection,
  FormStack,
} from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  url: string;
  uploading: boolean;
  onLabelChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmployeeDocumentUploadDialog({
  open,
  onOpenChange,
  label,
  url,
  uploading,
  onLabelChange,
  onUrlChange,
  onSubmit,
}: EmployeeDocumentUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Attach a file URL for this employee&apos;s records.
          </DialogDescription>
        </DialogHeader>

        <DialogSection density="compact">
          <FormStack
            as="form"
            id="employee-document-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="space-y-1.5">
              <Label>Document Label</Label>
              <Input
                placeholder="e.g. CNIC Front"
                value={label}
                onChange={(event) => onLabelChange(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>File URL</Label>
              <Input
                placeholder="https://..."
                value={url}
                onChange={(event) => onUrlChange(event.target.value)}
              />
            </div>
          </FormStack>
        </DialogSection>

        <DialogActionRow bordered={false}>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText="Add Document"
            submittingText="Saving..."
            submitting={uploading}
            submitFormId="employee-document-form"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
