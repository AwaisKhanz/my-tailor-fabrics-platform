"use client";

import { type Branch, type ShopFabric } from "@tbms/shared-types";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldStack,
} from "@tbms/ui/components/field";
import {
  DialogFormActions,
  FormGrid,
  FormStack,
} from "@tbms/ui/components/form-layout";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Input } from "@tbms/ui/components/input";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { Switch } from "@tbms/ui/components/switch";
import { Textarea } from "@tbms/ui/components/textarea";
import { Text } from "@tbms/ui/components/typography";
import type { ShopFabricFormValues } from "@/hooks/use-fabrics-page";

interface FabricFormDialogProps {
  open: boolean;
  editingFabric: ShopFabric | null;
  saving: boolean;
  branches: Branch[];
  branchSelectDisabled: boolean;
  form: ShopFabricFormValues;
  formError: string;
  fieldErrors: Partial<Record<keyof ShopFabricFormValues, string>>;
  onOpenChange: (open: boolean) => void;
  onUpdateField: <K extends keyof ShopFabricFormValues>(
    field: K,
    value: ShopFabricFormValues[K],
  ) => void;
  onSubmit: () => void | Promise<void>;
}

export function FabricFormDialog({
  open,
  editingFabric,
  saving,
  branches,
  branchSelectDisabled,
  form,
  formError,
  fieldErrors,
  onOpenChange,
  onUpdateField,
  onSubmit,
}: FabricFormDialogProps) {
  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingFabric ? "Edit Fabric Pricing" : "Add Fabric Pricing"}
      description="Keep a simple branch-level fabric catalog with name, brand, and selling price for the order wizard."
      maxWidthClass="sm:max-w-2xl"
      footerActions={
        <DialogFormActions
          onCancel={() => onOpenChange(false)}
          submitText={editingFabric ? "Save Changes" : "Create Fabric"}
          submittingText="Saving..."
          submitting={saving}
          submitFormId="shop-fabric-form"
        />
      }
    >
      <FormStack
        as="form"
        id="shop-fabric-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        {formError ? <FieldError size="sm">{formError}</FieldError> : null}

        <FormGrid columns="two" className="gap-4">
          <FieldStack>
            <FieldLabel htmlFor="fabric-branch">
              Branch <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              value={form.branchId}
              onValueChange={(value) => onUpdateField("branchId", value ?? "")}
              disabled={saving || branchSelectDisabled}
            >
              <SelectTrigger id="fabric-branch">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.branchId ? (
              <FieldError>{fieldErrors.branchId}</FieldError>
            ) : null}
            <FieldHint>
              {branchSelectDisabled
                ? "This follows the branch currently selected in the app header."
                : "Choose the branch that should use this fabric pricing record."}
            </FieldHint>
          </FieldStack>

          <FieldStack>
            <FieldLabel htmlFor="fabric-name">
              Fabric Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="fabric-name"
              value={form.name}
              onChange={(event) => onUpdateField("name", event.target.value)}
              placeholder="e.g. Wash n Wear Premium"
              disabled={saving}
            />
            {fieldErrors.name ? (
              <FieldError>{fieldErrors.name}</FieldError>
            ) : null}
          </FieldStack>

          <FieldStack>
            <FieldLabel htmlFor="fabric-brand">Brand</FieldLabel>
            <Input
              id="fabric-brand"
              value={form.brand}
              onChange={(event) => onUpdateField("brand", event.target.value)}
              placeholder="Optional mill or supplier"
              disabled={saving}
            />
          </FieldStack>

          <FieldStack>
            <FieldLabel htmlFor="fabric-rate">
              Selling Rate (Rs) <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="fabric-rate"
              type="text"
              inputMode="decimal"
              value={form.sellingRate}
              onChange={(event) => onUpdateField("sellingRate", event.target.value)}
              placeholder="e.g. 1250"
              disabled={saving}
            />
            {fieldErrors.sellingRate ? (
              <FieldError>{fieldErrors.sellingRate}</FieldError>
            ) : null}
          </FieldStack>
        </FormGrid>

        <FieldStack>
          <FieldLabel htmlFor="fabric-notes">Notes</FieldLabel>
          <Textarea
            id="fabric-notes"
            value={form.notes}
            onChange={(event) => onUpdateField("notes", event.target.value)}
            placeholder="Optional counter notes, quality notes, or branch-specific guidance."
            rows={4}
            disabled={saving}
          />
        </FieldStack>

        <InfoTile tone="secondary" layout="betweenGap" padding="contentLg">
          <div>
            <Text as="p" variant="body" className="font-medium">
              Available in order piece picker
            </Text>
            <Text as="p" variant="muted" className="text-xs">
              Active fabrics appear in the piece-first order wizard when staff choose shop fabric.
            </Text>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => onUpdateField("isActive", checked)}
            disabled={saving}
          />
        </InfoTile>
      </FormStack>
    </ScrollableDialog>
  );
}
