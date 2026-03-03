import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DESIGN_TYPE_ALL_SCOPE,
  type DesignTypeFormValues,
} from "@/hooks/use-design-type-dialog";

interface ScopeOption {
  id: string;
  name: string;
}

interface BranchOption extends ScopeOption {
  code: string;
}

interface DesignTypeDialogScopeFieldsProps {
  form: UseFormReturn<DesignTypeFormValues>;
  garmentTypes: ScopeOption[];
  branches: BranchOption[];
}

export function DesignTypeDialogScopeFields({
  form,
  garmentTypes,
  branches,
}: DesignTypeDialogScopeFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="garmentTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Applicable Garment</FormLabel>
            <Select value={field.value || DESIGN_TYPE_ALL_SCOPE} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger variant="premium">
                  <SelectValue placeholder="All Garments" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={DESIGN_TYPE_ALL_SCOPE}>All Garments</SelectItem>
                {garmentTypes.map((garment) => (
                  <SelectItem key={garment.id} value={garment.id}>
                    {garment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="branchId"
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Branch Scoping</FormLabel>
            <Select value={field.value || DESIGN_TYPE_ALL_SCOPE} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger variant="premium">
                  <SelectValue placeholder="Global (All Branches)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={DESIGN_TYPE_ALL_SCOPE}>Global (All Branches)</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </>
  );
}
