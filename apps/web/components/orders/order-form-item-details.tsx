import {
  DesignType,
  FabricSource,
  GarmentType,
} from "@tbms/shared-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import {
  ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME,
} from "@/components/orders/order-form-item.constants";
import { Textarea } from "@tbms/ui/components/textarea";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormItemDetailsProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  garmentTypes: GarmentType[];
  designTypeOptions: DesignType[];
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
}

export function OrderFormItemDetails({
  index,
  form,
  garmentTypes,
  designTypeOptions,
  onSelectGarmentType,
}: OrderFormItemDetailsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="md:col-span-6">
        <FormField
          control={form.control}
          name={`items.${index}.garmentTypeId`}
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem className="space-y-2">
              <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                Garment Type
              </FormLabel>
              <Select
                onValueChange={(value) =>
                  onSelectGarmentType(index, value ?? "")
                }
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select garment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {garmentTypes.map((garment) => (
                    <SelectItem key={garment.id} value={garment.id}>
                      {garment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-3">
        <FormField
          control={form.control}
          name={`items.${index}.quantity`}
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem className="space-y-2">
              <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                Quantity
              </FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-3">
        <FormField
          control={form.control}
          name={`items.${index}.unitPrice`}
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem className="space-y-2">
              <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                Unit Price (Rs)
              </FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`items.${index}.designTypeId`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem className="space-y-2 md:col-span-7">
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Design Type
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value === "NONE" ? undefined : value);
              }}
              value={field.value || "NONE"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Standard/No design" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="NONE">Standard / No Design</SelectItem>
                {designTypeOptions.map((designType) => (
                  <SelectItem key={designType.id} value={designType.id}>
                    {designType.name} (+{formatPKR(designType.defaultPrice)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${index}.fabricSource`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem className="space-y-2 md:col-span-5">
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Fabric Source
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={FabricSource.SHOP}>Shop</SelectItem>
                <SelectItem value={FabricSource.CUSTOMER}>Customer</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`items.${index}.description`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem className="space-y-2 md:col-span-12">
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Notes
            </FormLabel>
            <FormControl>
              <Textarea
                className="min-h-[84px] resize-y"
                placeholder="Collar style, sleeve notes, etc."
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
