import { DesignType, GarmentType } from "@tbms/shared-types";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { OrderFormItemCard } from "./order-form-item-card";

interface OrderFormItemsCardProps {
  form: UseFormReturn<OrderFormValues>;
  fields: FieldArrayWithId<OrderFormValues, "items", "id">[];
  watchedItems: OrderFormValues["items"];
  garmentTypes: GarmentType[];
  onAddItem: () => void;
  onRemoveItem: (itemIndex: number) => void;
  onAddAddon: (itemIndex: number) => void;
  onRemoveAddon: (itemIndex: number, addonIndex: number) => void;
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
  getDesignTypeOptions: (garmentTypeId?: string) => DesignType[];
  getItemLineTotal: (item: OrderFormValues["items"][number]) => number;
}

export function OrderFormItemsCard({
  form,
  fields,
  watchedItems,
  garmentTypes,
  onAddItem,
  onRemoveItem,
  onAddAddon,
  onRemoveAddon,
  onSelectGarmentType,
  getDesignTypeOptions,
  getItemLineTotal,
}: OrderFormItemsCardProps) {
  return (
    <Card>
      <CardHeader density="comfortable" align="startResponsive" gap="md" className="flex-row items-center !rounded-b-none justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="border-b !rounded-b-none border-border bg-muted/40 px-6 py-4">Order Items</CardTitle>
            <Badge variant="default" size="xs" className="font-semibold">
              {fields.length} PIECES
            </Badge>
          </div>
          <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">
            Configure garment, pricing, and design per piece.
          </Label>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4" />
          Add Piece
        </Button>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-4">
        {fields.map((field, index) => {
          const currentItem = watchedItems[index] || {
            garmentTypeId: "",
            quantity: 1,
            unitPrice: 0,
          };

          return (
            <OrderFormItemCard
              key={field.id}
              index={index}
              form={form}
              garmentTypes={garmentTypes}
              designTypeOptions={getDesignTypeOptions(
                currentItem.garmentTypeId,
              )}
              lineTotal={getItemLineTotal(currentItem)}
              canRemove={fields.length > 1}
              onSelectGarmentType={onSelectGarmentType}
              onRemoveItem={onRemoveItem}
              onAddAddon={onAddAddon}
              onRemoveAddon={onRemoveAddon}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
