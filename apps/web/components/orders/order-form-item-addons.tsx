import { AddonType, isAddonType } from "@tbms/shared-types";
import { ADDON_TYPE_OPTIONS } from "@tbms/shared-constants";
import { PlusCircle, XCircle } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
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
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="text-base">Addons & Custom Charges</CardTitle>
          <CardDescription>
            Add optional charges for this piece.
          </CardDescription>
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
      </CardHeader>

      <CardContent className="space-y-3">
        {addons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No addon charges for this piece.
          </p>
        ) : (
          <div className="space-y-2">
            {addons.map((addon, addonIndex) => (
              <div
                key={`${index}-${addonIndex}`}
                className="grid grid-cols-1 items-end gap-2 rounded-md border p-2 md:grid-cols-12"
              >
                <div className="md:col-span-3">
                  <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                    Type
                  </Label>
                  <Select
                    value={addon.type || AddonType.EXTRA}
                    onValueChange={(value) => {
                      if (!value || !isAddonType(value)) {
                        return;
                      }
                      form.setValue(`items.${index}.addons.${addonIndex}.type`, value, {
                        shouldDirty: true,
                      });
                    }}
                  >
                    <SelectTrigger>
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
                  <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                    Name
                  </Label>
                  <Input
                    placeholder="Charge name"
                    {...form.register(`items.${index}.addons.${addonIndex}.name` as const)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                    Amount
                  </Label>
                  <Input
                    type="number"
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
