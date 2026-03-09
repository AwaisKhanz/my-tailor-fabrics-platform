import { AddonType, isAddonType } from "@tbms/shared-types";
import { ADDON_TYPE_OPTIONS } from "@tbms/shared-constants";
import { PlusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoTile } from "@/components/ui/info-tile";
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
    <InfoTile tone="secondary" borderStyle="dashed" padding="xs">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
          Addons & Custom Charges
        </Label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 gap-1 text-xs font-semibold"
          onClick={() => onAddAddon(index)}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add Charge
        </Button>
      </div>

      {addons.length === 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          No addon charges for this piece.
        </p>
      ) : (
        <div className="space-y-2">
          {addons.map((addon, addonIndex) => (
            <InfoTile
              key={`${index}-${addonIndex}`}
              tone="default"
              padding="none"
              className="grid grid-cols-1 items-end gap-2 rounded-md p-2 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <Select
                  value={addon.type || AddonType.EXTRA}
                  onValueChange={(value) => {
                    if (!isAddonType(value)) {
                      return;
                    }
                    form.setValue(`items.${index}.addons.${addonIndex}.type`, value, {
                      shouldDirty: true,
                    });
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDON_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.type} value={option.type}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-6">
                <Input
                  className="h-8"
                  placeholder="Charge name"
                  {...form.register(`items.${index}.addons.${addonIndex}.name` as const)}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  type="number"
                  className="h-8"
                  placeholder="Amount"
                  {...form.register(`items.${index}.addons.${addonIndex}.price` as const, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="flex md:col-span-1 md:justify-end">
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
            </InfoTile>
          ))}
        </div>
      )}
    </InfoTile>
  );
}
