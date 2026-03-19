import { AddonType, isAddonType } from "@tbms/shared-types";
import { ADDON_TYPE_OPTIONS } from "@tbms/shared-constants";
import { PlusCircle, XCircle } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { Label } from "@tbms/ui/components/label";
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
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormItemAddonsProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  watchedAddons: OrderFormValues["items"][number]["addons"];
  onAddAddon: (itemIndex: number) => void;
  onRemoveAddon: (itemIndex: number, addonIndex: number) => void;
}

export function OrderFormItemAddons({
  index,
  form,
  watchedAddons,
  onAddAddon,
  onRemoveAddon,
}: OrderFormItemAddonsProps) {
  const addons = watchedAddons ?? [];

  return (
    <section className="space-y-4 rounded-md border bg-muted/10 px-4 py-4">
      <div className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-foreground">
            Addons & Custom Charges
          </h4>
          <p className="text-sm text-muted-foreground">
            Optional charges that belong only to this piece.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1"
          onClick={() => onAddAddon(index)}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Charge
        </Button>
      </div>

      {addons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No addon charges for this piece.
        </p>
      ) : (
        <div className="space-y-2">
          {addons.map((addon, addonIndex) => (
            <div
              key={`${index}-${addonIndex}`}
              className="grid grid-cols-1 gap-3 rounded-md border bg-background/60 p-3 lg:grid-cols-12 lg:items-stretch"
            >
              <div className="space-y-2 lg:col-span-3">
                <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                  Type
                </Label>
                <FormField
                  control={form.control}
                  name={`items.${index}.addons.${addonIndex}.type`}
                  render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                    <FormItem>
                      <Select
                        value={field.value || AddonType.EXTRA}
                        onValueChange={(value) => {
                          if (!value || !isAddonType(value)) {
                            return;
                          }
                          field.onChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ADDON_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.type} value={option.type}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 lg:col-span-6">
                <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                  Name
                </Label>
                <FormField
                  control={form.control}
                  name={`items.${index}.addons.${addonIndex}.name`}
                  render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Charge name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                  Amount / piece
                </Label>
                <FormField
                  control={form.control}
                  name={`items.${index}.addons.${addonIndex}.price`}
                  render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={field.value ?? 0}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            field.onChange(
                              nextValue.trim() === "" ? 0 : Number(nextValue),
                            );
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex lg:col-span-1 lg:justify-end lg:self-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveAddon(index, addonIndex)}
                  aria-label={`Remove addon ${addonIndex + 1}`}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
