import { ROLES } from "@tbms/shared-constants";
import { Role, type UserAccount } from "@tbms/shared-types";
import { type Branch } from "@/lib/api/branches";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  onOpenChange,
  onFormFieldChange,
  onSave,
}: UserAccountDialogProps) {
  const isCreateMode = !editingUser;
  const isSubmitDisabled =
    saving ||
    !form.name.trim() ||
    !form.email.trim() ||
    (isCreateMode && !form.password.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User Account" : "Create User Account"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              variant="premium"
              placeholder="Staff member name"
              value={form.name}
              onChange={(event) => onFormFieldChange("name", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              variant="premium"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(event) => onFormFieldChange("email", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Password{" "}
              {editingUser ? (
                "(leave blank to keep current)"
              ) : (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              variant="premium"
              type="password"
              placeholder={editingUser ? "Enter new password" : "Minimum 8 characters"}
              value={form.password}
              onChange={(event) => onFormFieldChange("password", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.role}
              onValueChange={(value) => onFormFieldChange("role", value as Role)}
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSubmitDisabled}>
            {saving
              ? editingUser
                ? "Updating..."
                : "Creating..."
              : editingUser
                ? "Save Changes"
                : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
