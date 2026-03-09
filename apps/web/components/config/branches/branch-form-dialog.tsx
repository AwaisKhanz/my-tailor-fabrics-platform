import { type Branch } from "@tbms/shared-types";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { Text } from "@/components/ui/typography";
import { type BranchFormState } from "@/hooks/use-branch-dialog-manager";

interface BranchFormDialogProps {
  open: boolean;
  editingBranch: Branch | null;
  saving: boolean;
  form: BranchFormState;
  formError: string;
  fieldErrors: Partial<Record<keyof BranchFormState, string>>;
  onOpenChange: (open: boolean) => void;
  onFieldChange: <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => void;
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
        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}
        {!editingBranch ? (
          <div className="space-y-1.5">
            <Label>
              Branch Code <span className="text-destructive">*</span>
            </Label>
            <Input
             
              placeholder="e.g. LHR, KHI"
              value={form.code}
              maxLength={6}
              onChange={(event) => onFieldChange("code", event.target.value.toUpperCase())}
            />
            {fieldErrors.code ? (
              <p className="text-xs text-destructive">{fieldErrors.code}</p>
            ) : null}
            <Text as="p"  variant="muted">
              Short unique code used in order and customer numbers. Cannot be changed later.
            </Text>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label>
            Branch Name <span className="text-destructive">*</span>
          </Label>
          <Input
           
            placeholder="e.g. Lahore Main Branch"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
           
            placeholder="Contact number"
            value={form.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
          />
          {fieldErrors.phone ? (
            <p className="text-xs text-destructive">{fieldErrors.phone}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input
           
            placeholder="Street address"
            value={form.address}
            onChange={(event) => onFieldChange("address", event.target.value)}
          />
          {fieldErrors.address ? (
            <p className="text-xs text-destructive">{fieldErrors.address}</p>
          ) : null}
        </div>
      </FormStack>
    </ScrollableDialog>
  );
}
