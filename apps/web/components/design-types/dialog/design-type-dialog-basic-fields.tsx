import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { type DesignTypeFormValues } from "@/hooks/use-design-type-dialog";

interface DesignTypeDialogBasicFieldsProps {
  form: UseFormReturn<DesignTypeFormValues>;
}

export function DesignTypeDialogBasicFields({
  form,
}: DesignTypeDialogBasicFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem>
            <FormLabel>Design Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Simple, Heavy, Embroidery" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="defaultPrice"
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem>
              <FormLabel>Customer Price (Rs)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultRate"
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem>
              <FormLabel>Employee Rate (Rs)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
