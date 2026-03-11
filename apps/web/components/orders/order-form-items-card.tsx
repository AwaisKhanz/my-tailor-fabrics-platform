import { DesignType, GarmentType } from "@tbms/shared-types";
import { Plus } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import { Sortable, SortableItem } from "@tbms/ui/components/reui/sortable";
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
  onMoveItem: (fromIndex: number, toIndex: number) => void;
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
  onMoveItem,
  onAddAddon,
  onRemoveAddon,
  onSelectGarmentType,
  getDesignTypeOptions,
  getItemLineTotal,
}: OrderFormItemsCardProps) {
  return (
    <Card>
      <CardHeader
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle>Order Items</CardTitle>
            <Badge variant="default" className="font-semibold">
              {fields.length} PIECES
            </Badge>
          </div>
          <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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

      <CardContent>
        <Sortable
          value={fields}
          onValueChange={() => undefined}
          onMove={({ activeIndex, overIndex }) =>
            onMoveItem(activeIndex, overIndex)
          }
          getItemValue={(item) => item.id}
          className="space-y-4"
        >
          {fields.map((field, index) => {
            const currentItem = watchedItems[index] || {
              garmentTypeId: "",
              quantity: 1,
              unitPrice: 0,
            };

            return (
              <SortableItem key={field.id} value={field.id}>
                <OrderFormItemCard
                  index={index}
                  form={form}
                  garmentTypes={garmentTypes}
                  designTypeOptions={getDesignTypeOptions(
                    currentItem.garmentTypeId,
                  )}
                  lineTotal={getItemLineTotal(currentItem)}
                  canRemove={fields.length > 1}
                  canReorder={fields.length > 1}
                  onSelectGarmentType={onSelectGarmentType}
                  onRemoveItem={onRemoveItem}
                  onAddAddon={onAddAddon}
                  onRemoveAddon={onRemoveAddon}
                />
              </SortableItem>
            );
          })}
        </Sortable>
      </CardContent>
    </Card>
  );
}
