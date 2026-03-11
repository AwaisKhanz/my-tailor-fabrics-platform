import {
  DialogFormActions,
  FormStack,
} from "@tbms/ui/components/form-layout";
import { FieldError, FieldLabel, FieldStack } from "@tbms/ui/components/field";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";

interface EmployeeDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  url: string;
  uploading: boolean;
  fieldErrors: {
    label?: string;
    url?: string;
  };
  validationError: string;
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
  fieldErrors,
  validationError,
  onLabelChange,
  onUrlChange,
  onSubmit,
}: EmployeeDocumentUploadDialogProps) {
  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Document"
      description="Attach a file URL for this employee's records."
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText="Add Document"
          submittingText="Saving..."
          submitting={uploading}
          submitFormId="employee-document-form"
        />
      }
    >
      <FormStack
        as="form"
        id="employee-document-form"
        density="default"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {validationError ? <FieldError size="sm">{validationError}</FieldError> : null}
        <FieldStack>
          <FieldLabel>Document Label</FieldLabel>
          <Input
            placeholder="e.g. CNIC Front"
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
          />
          {fieldErrors.label ? <FieldError>{fieldErrors.label}</FieldError> : null}
        </FieldStack>
        <FieldStack>
          <FieldLabel>File URL</FieldLabel>
          <Input
            placeholder="https://..."
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
          />
          {fieldErrors.url ? <FieldError>{fieldErrors.url}</FieldError> : null}
        </FieldStack>
      </FormStack>
    </ScrollableDialog>
  );
}
