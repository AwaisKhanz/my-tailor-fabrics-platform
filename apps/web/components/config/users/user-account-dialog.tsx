import { isRole, ROLES } from "@tbms/shared-constants";
import { type UserAccount } from "@tbms/shared-types";
import { type Branch } from "@/lib/api/branches";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogActionRow, DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  USERS_ALL_BRANCHES_VALUE,
  type UpdateUserFormField,
  type UserFormState,
} from "@/hooks/use-users-page";

interface UserAccountDialogProps {
  open: boolean;
  editingUser: UserAccount | null;
  form: UserFormState;
  branches: Branch[];
  saving: boolean;
  formError: string;
  fieldErrors: Partial<Record<keyof UserFormState, string>>;
  onOpenChange: (open: boolean) => void;
  onFormFieldChange: UpdateUserFormField;
  onSave: () => void;
}

export function UserAccountDialog({
  open,
  editingUser,
  form,
  branches,
  saving,
  formError,
  fieldErrors,
  onOpenChange,
  onFormFieldChange,
  onSave,
}: UserAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User Account" : "Create User Account"}</DialogTitle>
        </DialogHeader>

        <FormStack
          as="form"
          id="user-account-form"
          className="py-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
          <div className="space-y-1.5">
            <Label>
              Full Name <span className="text-error">*</span>
            </Label>
            <Input
              variant="premium"
              placeholder="Staff member name"
              value={form.name}
              onChange={(event) => onFormFieldChange("name", event.target.value)}
            />
            {fieldErrors.name ? (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>
              Email <span className="text-error">*</span>
            </Label>
            <Input
              variant="premium"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(event) => onFormFieldChange("email", event.target.value)}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>
              Password{" "}
              {editingUser ? (
                "(leave blank to keep current)"
              ) : (
                <span className="text-error">*</span>
              )}
            </Label>
            <Input
              variant="premium"
              type="password"
              placeholder={editingUser ? "Enter new password" : "Minimum 8 characters"}
              value={form.password}
              onChange={(event) => onFormFieldChange("password", event.target.value)}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>
              Role <span className="text-error">*</span>
            </Label>
            <Select
              value={form.role}
              onValueChange={(value) => {
                if (isRole(value)) {
                  onFormFieldChange("role", value);
                }
              }}
            >
              <SelectTrigger variant="premium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.role ? (
              <p className="text-xs text-destructive">{fieldErrors.role}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Select value={form.branchId} onValueChange={(value) => onFormFieldChange("branchId", value)}>
              <SelectTrigger variant="premium">
                <SelectValue placeholder="Select branch (leave blank for all)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={USERS_ALL_BRANCHES_VALUE}>All Branches</SelectItem>
                {branches
                  .filter((branch) => branch.id)
                  .map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {fieldErrors.branchId ? (
              <p className="text-xs text-destructive">{fieldErrors.branchId}</p>
            ) : null}
          </div>
        </FormStack>

        <DialogActionRow>
          <DialogFormActions
            onCancel={() => onOpenChange(false)}
            submitText={editingUser ? "Save Changes" : "Create Account"}
            submittingText={editingUser ? "Updating..." : "Creating..."}
            submitting={saving}
            submitFormId="user-account-form"
          />
        </DialogActionRow>
      </DialogContent>
    </Dialog>
  );
}
