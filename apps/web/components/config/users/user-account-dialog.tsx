import { isRole, ROLES } from "@tbms/shared-constants";
import { type UserAccount } from "@tbms/shared-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, FieldLabel, FieldStack } from "@/components/ui/field";
import {
  DialogActionRow,
  DialogFormActions,
  FormStack,
} from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type UpdateUserFormField,
  type UserFormState,
} from "@/hooks/use-user-account-manager";

interface UserAccountDialogProps {
  open: boolean;
  editingUser: UserAccount | null;
  form: UserFormState;
  branchOptions: {
    value: string;
    label: string;
  }[];
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
  branchOptions,
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
          <DialogTitle>
            {editingUser ? "Edit User Account" : "Create User Account"}
          </DialogTitle>
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
          {formError ? <FieldError size="sm">{formError}</FieldError> : null}
          <FieldStack className="space-y-1.5">
            <FieldLabel>
              Full Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              placeholder="Staff member name"
              value={form.name}
              onChange={(event) =>
                onFormFieldChange("name", event.target.value)
              }
            />
            {fieldErrors.name ? (
              <FieldError>{fieldErrors.name}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack className="space-y-1.5">
            <FieldLabel>
              Email <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(event) =>
                onFormFieldChange("email", event.target.value)
              }
            />
            {fieldErrors.email ? (
              <FieldError>{fieldErrors.email}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack className="space-y-1.5">
            <FieldLabel>
              Password{" "}
              {editingUser ? (
                "(leave blank to keep current)"
              ) : (
                <span className="text-destructive">*</span>
              )}
            </FieldLabel>
            <Input
              type="password"
              placeholder={
                editingUser ? "Enter new password" : "Minimum 8 characters"
              }
              value={form.password}
              onChange={(event) =>
                onFormFieldChange("password", event.target.value)
              }
            />
            {fieldErrors.password ? (
              <FieldError>{fieldErrors.password}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack className="space-y-1.5">
            <FieldLabel>
              Role <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              value={form.role}
              onValueChange={(value) => {
                if (isRole(value)) {
                  onFormFieldChange("role", value);
                }
              }}
            >
              <SelectTrigger>
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
              <FieldError>{fieldErrors.role}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack className="space-y-1.5">
            <FieldLabel>Branch</FieldLabel>
            <Select
              value={form.branchId}
              onValueChange={(value) => onFormFieldChange("branchId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch (leave blank for all)" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.branchId ? (
              <FieldError>{fieldErrors.branchId}</FieldError>
            ) : null}
          </FieldStack>
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
