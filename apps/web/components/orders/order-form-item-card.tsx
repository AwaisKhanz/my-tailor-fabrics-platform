import {
  DesignType,
  FabricSource,
  GarmentType,
} from "@tbms/shared-types";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoTile } from "@/components/ui/info-tile";
import { OrderFormItemAddons } from "@/components/orders/order-form-item-addons";
import {
  ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME,
} from "@/components/orders/order-form-item.constants";
import { Textarea } from "@/components/ui/textarea";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormItemCardProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  garmentTypes: GarmentType[];
  designTypeOptions: DesignType[];
  lineTotal: number;
  canRemove: boolean;
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
  onRemoveItem: (itemIndex: number) => void;
  onAddAddon: (itemIndex: number) => void;
  onRemoveAddon: (itemIndex: number, addonIndex: number) => void;
}

export function OrderFormItemCard({
  index,
  form,
  garmentTypes,
  designTypeOptions,
  lineTotal,
  canRemove,
  onSelectGarmentType,
  onRemoveItem,
  onAddAddon,
  onRemoveAddon,
}: OrderFormItemCardProps) {
  const watchedAddons = form.watch(`items.${index}.addons`) || [];
  const garmentTypeId = form.watch(`items.${index}.garmentTypeId`);
  const selectedGarment = garmentTypes.find(
    (garment) => garment.id === garmentTypeId,
  );

  return (
    <InfoTile
      padding="none"
      tone="default"
      radius="xl"
      className="space-y-5 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <InfoTile
              tone="default"
              padding="none"
              className="text-right !text-xs p-1"
            >
              PIECE {index + 1}
            </InfoTile>
            {selectedGarment ? (
              <Badge variant="info" size="xs" className="font-bold">
                {selectedGarment.name}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Configure garment, quantity, pricing, and production details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <InfoTile
            tone="default"
            padding="none"
            className="text-right p-1 !text-xs "
          >
            <p className=" text-foreground">
              {formatPKR(Math.round(lineTotal * 100))}
            </p>
          </InfoTile>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onRemoveItem(index)}
            disabled={!canRemove}
            aria-label={`Remove piece ${index + 1}`}
            title="Remove piece"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          <FormField
            control={form.control}
            name={`items.${index}.garmentTypeId`}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                  Garment Type
                </FormLabel>
                <Select
                  onValueChange={(value) => onSelectGarmentType(index, value)}
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
            render={({ field }) => (
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
            render={({ field }) => (
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
          render={({ field }) => (
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
          render={({ field }) => (
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
                  <SelectItem value={FabricSource.CUSTOMER}>
                    Customer
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.description`}
          render={({ field }) => (
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

      <OrderFormItemAddons
        index={index}
        form={form}
        watchedAddons={watchedAddons}
        onAddAddon={onAddAddon}
        onRemoveAddon={onRemoveAddon}
      />
    </InfoTile>
  );
}
