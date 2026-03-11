import { type Branch } from "@tbms/shared-types";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldStack,
} from "@tbms/ui/components/field";
import { DialogFormActions, FormStack } from "@tbms/ui/components/form-layout";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { type BranchFormState } from "@/hooks/use-branch-dialog-manager";

interface BranchFormDialogProps {
  open: boolean;
  editingBranch: Branch | null;
  saving: boolean;
  form: BranchFormState;
  formError: string;
  fieldErrors: Partial<Record<keyof BranchFormState, string>>;
  onOpenChange: (open: boolean) => void;
  onFieldChange: <K extends keyof BranchFormState>(
    field: K,
    value: BranchFormState[K],
  ) => void;
  onSubmit: () => void;
}

export function BranchFormDialog({
  open,
  editingBranch,
  saving,
  form,
  formError,
  fieldErrors,
  onOpenChange,
  onFieldChange,
  onSubmit,
}: BranchFormDialogProps) {
  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="branch-form"
      submitText={editingBranch ? "Save Changes" : "Create Branch"}
      submitting={saving}
      cancelVariant="outline"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingBranch ? "Edit Branch" : "Create Branch"}
      footerActions={footerActions}
    >
      <FormStack
        as="form"
        id="branch-form"
        className="py-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {formError ? <FieldError size="sm">{formError}</FieldError> : null}
        {!editingBranch ? (
          <FieldStack className="space-y-1.5">
            <FieldLabel>
              Branch Code <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              placeholder="e.g. LHR, KHI"
              value={form.code}
              maxLength={6}
              onChange={(event) =>
                onFieldChange("code", event.target.value.toUpperCase())
              }
            />
            {fieldErrors.code ? (
              <FieldError>{fieldErrors.code}</FieldError>
            ) : null}
            <FieldHint>
              Short unique code used in order and customer numbers. Cannot be
              changed later.
            </FieldHint>
          </FieldStack>
        ) : null}

        <FieldStack className="space-y-1.5">
          <FieldLabel>
            Branch Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            placeholder="e.g. Lahore Main Branch"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
          />
          {fieldErrors.name ? (
            <FieldError>{fieldErrors.name}</FieldError>
          ) : null}
        </FieldStack>

        <FieldStack className="space-y-1.5">
          <FieldLabel>Phone</FieldLabel>
          <Input
            placeholder="Contact number"
            value={form.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
          />
          {fieldErrors.phone ? (
            <FieldError>{fieldErrors.phone}</FieldError>
          ) : null}
        </FieldStack>

        <FieldStack className="space-y-1.5">
          <FieldLabel>Address</FieldLabel>
          <Input
            placeholder="Street address"
            value={form.address}
            onChange={(event) => onFieldChange("address", event.target.value)}
          />
          {fieldErrors.address ? (
            <FieldError>{fieldErrors.address}</FieldError>
          ) : null}
        </FieldStack>
      </FormStack>
    </ScrollableDialog>
  );
}
