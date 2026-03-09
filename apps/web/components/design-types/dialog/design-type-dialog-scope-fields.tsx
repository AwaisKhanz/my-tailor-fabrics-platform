import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DESIGN_TYPE_ALL_GARMENTS_LABEL,
  DESIGN_TYPE_ALL_SCOPE,
  DESIGN_TYPE_GLOBAL_BRANCH_SCOPE_LABEL,
  type DesignTypeFormValues,
} from "@/hooks/use-design-type-dialog";

interface ScopeOption {
  value: string;
  label: string;
}

interface DesignTypeDialogScopeFieldsProps {
  form: UseFormReturn<DesignTypeFormValues>;
  garmentScopeOptions: ScopeOption[];
  branchScopeOptions: ScopeOption[];
}

export function DesignTypeDialogScopeFields({
  form,
  garmentScopeOptions,
  branchScopeOptions,
}: DesignTypeDialogScopeFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="garmentTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-bold uppercase  text-muted-foreground">
              Applicable Garment
            </FormLabel>
            <Select
              value={field.value || DESIGN_TYPE_ALL_SCOPE}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={DESIGN_TYPE_ALL_GARMENTS_LABEL} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {garmentScopeOptions.map((garment) => (
                  <SelectItem key={garment.value} value={garment.value}>
                    {garment.label}
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
            <FormLabel className="text-sm font-bold uppercase  text-muted-foreground">
              Branch Scoping
            </FormLabel>
            <Select
              value={field.value || DESIGN_TYPE_ALL_SCOPE}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={DESIGN_TYPE_GLOBAL_BRANCH_SCOPE_LABEL} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {branchScopeOptions.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
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
