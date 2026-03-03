import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type DesignTypeFormValues } from "@/hooks/use-design-type-dialog";

interface DesignTypeDialogBasicFieldsProps {
  form: UseFormReturn<DesignTypeFormValues>;
}

export function DesignTypeDialogBasicFields({ form }: DesignTypeDialogBasicFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem>
            <FormLabel variant="dashboard">Design Name</FormLabel>
            <FormControl>
              <Input
                variant="premium"
                placeholder="e.g. Simple, Heavy, Embroidery"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="defaultPrice"
          rules={{ required: true, min: 0 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Customer Price (Rs)</FormLabel>
              <FormControl>
                <Input variant="premium" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultRate"
          rules={{ required: true, min: 0 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Employee Rate (Rs)</FormLabel>
              <FormControl>
                <Input variant="premium" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
