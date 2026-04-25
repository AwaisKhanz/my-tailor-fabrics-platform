import { FabricSource } from "@tbms/shared-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Textarea } from "@tbms/ui/components/textarea";
import { ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME } from "@/components/orders/order-form-item.constants";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormItemOptionalFieldsProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  fabricSource: FabricSource;
}

export function OrderFormItemOptionalFields({
  index,
  form,
  fabricSource,
}: OrderFormItemOptionalFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {fabricSource === FabricSource.CUSTOMER ? (
        <FormField
          control={form.control}
          name={`items.${index}.customerFabricNote`}
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem className="space-y-2">
              <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                Customer Fabric Note
              </FormLabel>
              <FormControl>
                <Textarea
                  className="field-sizing-fixed min-h-[96px] resize-y"
                  placeholder="Color, fabric marks, cut note, or handling reminder"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name={`items.${index}.description`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem
            className={`space-y-2 ${
              fabricSource === FabricSource.CUSTOMER ? "" : "lg:col-span-2"
            }`}
          >
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Piece Notes
            </FormLabel>
            <FormControl>
              <Textarea
                className="field-sizing-fixed min-h-[112px] resize-y"
                placeholder="Collar, sleeve, lining, button, or delivery notes"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
