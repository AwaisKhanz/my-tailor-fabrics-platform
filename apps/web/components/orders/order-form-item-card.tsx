import {
  DesignType,
  GarmentType,
} from "@tbms/shared-types";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoTile } from "@/components/ui/info-tile";
import { OrderFormItemAddons } from "@/components/orders/order-form-item-addons";
import { OrderFormItemDetails } from "@/components/orders/order-form-item-details";
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

      <OrderFormItemDetails
        index={index}
        form={form}
        garmentTypes={garmentTypes}
        designTypeOptions={designTypeOptions}
        onSelectGarmentType={onSelectGarmentType}
      />

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
