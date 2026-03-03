import { type Branch } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { Typography } from "@/components/ui/typography";
import { type BranchFormState } from "@/hooks/use-branches-page";

interface BranchFormDialogProps {
  open: boolean;
  editingBranch: Branch | null;
  saving: boolean;
  form: BranchFormState;
  onOpenChange: (open: boolean) => void;
  onFieldChange: <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => void;
  onSubmit: () => void;
}

export function BranchFormDialog({
  open,
  editingBranch,
  saving,
  form,
  onOpenChange,
  onFieldChange,
  onSubmit,
}: BranchFormDialogProps) {
  const isCreateMode = !editingBranch;
  const footerActions = (
    <div className="flex w-full justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="branch-form"
        variant="premium"
        disabled={saving || !form.name.trim() || (isCreateMode && !form.code.trim())}
      >
        {saving ? "Saving..." : editingBranch ? "Save Changes" : "Create Branch"}
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingBranch ? "Edit Branch" : "Create Branch"}
      footerActions={footerActions}
    >
      <form
        id="branch-form"
        className="space-y-4 py-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {!editingBranch ? (
          <div className="space-y-1.5">
            <Label>
              Branch Code <span className="text-destructive">*</span>
            </Label>
            <Input
              variant="premium"
              placeholder="e.g. LHR, KHI"
              value={form.code}
              maxLength={6}
              onChange={(event) => onFieldChange("code", event.target.value.toUpperCase())}
            />
            <Typography as="p" variant="muted">
              Short unique code used in order and customer numbers. Cannot be changed later.
            </Typography>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label>
            Branch Name <span className="text-destructive">*</span>
          </Label>
          <Input
            variant="premium"
            placeholder="e.g. Lahore Main Branch"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            variant="premium"
            placeholder="Contact number"
            value={form.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input
            variant="premium"
            placeholder="Street address"
            value={form.address}
            onChange={(event) => onFieldChange("address", event.target.value)}
          />
        </div>
      </form>
    </ScrollableDialog>
  );
}
