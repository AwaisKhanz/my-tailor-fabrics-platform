import { useMemo, useState } from "react";
import {
  AddonType,
  DesignType,
  FabricSource,
  GarmentType,
  ShopFabric,
} from "@tbms/shared-types";
import {
  ChevronDown,
  Copy,
  GripVertical,
  Layers3,
  PackagePlus,
  Trash2,
} from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@tbms/ui/components/card";
import { Checkbox } from "@tbms/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";
import { SortableItemHandle } from "@tbms/ui/components/reui/sortable";
import { OrderFormItemAddons } from "@/components/orders/order-form-item-addons";
import { OrderFormItemDetails } from "@/components/orders/order-form-item-details";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import { useWatch, type UseFormReturn } from "react-hook-form";

interface OrderFormItemCardProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  garmentTypes: GarmentType[];
  shopFabrics: ShopFabric[];
  designTypeOptions: DesignType[];
  getItemLineTotal: (item: OrderFormValues["items"][number]) => number;
  expanded: boolean;
  selected: boolean;
  canRemove: boolean;
  canReorder: boolean;
  onToggleSelected: () => void;
  onToggleExpanded: () => void;
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
  onSelectFabricSource: (itemIndex: number, fabricSource: FabricSource) => void;
  onSelectShopFabric: (itemIndex: number, fabricId: string) => void;
  onDuplicateItem: (itemIndex: number, copies?: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onAddAddon: (itemIndex: number) => void;
  onRemoveAddon: (itemIndex: number, addonIndex: number) => void;
}

export function OrderFormItemCard({
  index,
  form,
  garmentTypes,
  shopFabrics,
  designTypeOptions,
  getItemLineTotal,
  expanded,
  selected,
  canRemove,
  canReorder,
  onToggleSelected,
  onToggleExpanded,
  onSelectGarmentType,
  onSelectFabricSource,
  onSelectShopFabric,
  onDuplicateItem,
  onRemoveItem,
  onAddAddon,
  onRemoveAddon,
}: OrderFormItemCardProps) {
  const [duplicateMenuOpen, setDuplicateMenuOpen] = useState(false);
  const watchedItem =
    useWatch({
      control: form.control,
      name: `items.${index}`,
    }) ?? null;
  const watchedAddons = useWatch({
    control: form.control,
    name: `items.${index}.addons`,
  });

  const liveItem = useMemo(() => {
    if (!watchedItem) {
      return null;
    }

    return {
      id: watchedItem.id,
      garmentTypeId: watchedItem.garmentTypeId ?? "",
      quantity: 1,
      unitPrice: Number(watchedItem.unitPrice ?? 0),
      dueDate: watchedItem.dueDate,
      description: watchedItem.description ?? "",
      fabricSource: watchedItem.fabricSource ?? FabricSource.CUSTOMER,
      shopFabricId: watchedItem.shopFabricId ?? undefined,
      shopFabricPrice:
        watchedItem.shopFabricPrice === undefined ||
        watchedItem.shopFabricPrice === null
          ? undefined
          : Number(watchedItem.shopFabricPrice),
      customerFabricNote: watchedItem.customerFabricNote ?? "",
      designTypeId: watchedItem.designTypeId,
      addons: (watchedAddons ?? []).map((addon) => ({
        type: addon?.type ?? AddonType.EXTRA,
        name: addon?.name ?? "",
        price: Number(addon?.price ?? 0),
      })),
    };
  }, [watchedAddons, watchedItem]);

  const selectedGarment = garmentTypes.find(
    (garment) => garment.id === liveItem?.garmentTypeId,
  );
  const selectedDesignType = designTypeOptions.find(
    (designType) => designType.id === liveItem?.designTypeId,
  );
  const selectedFabric = shopFabrics.find(
    (fabric) => fabric.id === liveItem?.shopFabricId,
  );
  const lineTotal = liveItem ? getItemLineTotal(liveItem) : 0;
  const addonsTotal = (liveItem?.addons || []).reduce(
    (total, addon) => total + Number(addon.price || 0),
    0,
  );
  const shopFabricTotal =
    liveItem?.fabricSource === FabricSource.SHOP
      ? Number(liveItem.shopFabricPrice || 0)
      : 0;
  const summaryChips = useMemo(() => {
    if (!liveItem) {
      return ["Garment pending"];
    }

    const chips = [];

    if (Number(liveItem.unitPrice || 0) > 0) {
      chips.push(
        `Tailoring ${formatPKR(Math.round(Number(liveItem.unitPrice || 0) * 100))}`,
      );
    }

    if (liveItem.fabricSource === FabricSource.SHOP) {
      if (shopFabricTotal > 0) {
        chips.push(`Fabric ${formatPKR(Math.round(shopFabricTotal * 100))}`);
      }
    }

    if (addonsTotal > 0) {
      chips.push(
        `${liveItem.addons.length} add-on${liveItem.addons.length === 1 ? "" : "s"} (${formatPKR(
          Math.round(addonsTotal * 100),
        )})`,
      );
    }

    return chips.length > 0 ? chips : ["Charges update automatically"];
  }, [
    addonsTotal,
    liveItem,
    shopFabricTotal,
  ]);

  const summaryLine = useMemo(() => {
    if (!liveItem) {
      return "Choose garment, design, and fabric source for this piece.";
    }

    const garmentLabel = selectedGarment?.name || "Garment pending";
    const designLabel = selectedDesignType?.name || "Standard";
    const fabricLabel =
      liveItem.fabricSource === FabricSource.SHOP
        ? selectedFabric?.name || "Shop fabric"
        : "Customer fabric";

    return `${garmentLabel} • ${designLabel} • ${fabricLabel}`;
  }, [liveItem, selectedDesignType?.name, selectedFabric?.name, selectedGarment?.name]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <label className="mr-1 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Checkbox
                  checked={selected}
                  onCheckedChange={onToggleSelected}
                  aria-label={`Select piece ${index + 1} for bulk actions`}
                />
                <span>Select</span>
              </label>
              <Badge variant="outline">Piece {index + 1}</Badge>
            </div>
            <CardDescription className="text-sm">{summaryLine}</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canReorder ? (
              <SortableItemHandle
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Reorder piece ${index + 1}`}
                    title="Drag to reorder"
                  />
                }
              >
                <GripVertical className="h-4 w-4" />
              </SortableItemHandle>
            ) : null}
            <DropdownMenu open={duplicateMenuOpen} onOpenChange={setDuplicateMenuOpen}>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="outline" size="sm" />
                }
              >
                <Copy className="h-4 w-4" />
                Copy
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Create Similar Pieces</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onDuplicateItem(index, 1)}
                    className="cursor-pointer"
                  >
                    <PackagePlus className="h-4 w-4" />1 more like this
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDuplicateItem(index, 2)}
                    className="cursor-pointer"
                  >
                    <Layers3 className="h-4 w-4" />2 more like this
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDuplicateItem(index, 5)}
                    className="cursor-pointer"
                  >
                    <Layers3 className="h-4 w-4" />5 more like this
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="rounded-md bg-muted/40 px-3 py-1.5 text-sm font-semibold text-foreground">
              {formatPKR(Math.round(lineTotal * 100))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleExpanded}
              aria-label={expanded ? "Collapse piece" : "Expand piece"}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </Button>
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
        <div className="flex flex-wrap gap-2">
          {summaryChips.map((chip) => (
            <Badge key={`${index}-${chip}`} variant="outline" className="text-xs font-medium">
              {chip}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="space-y-4">
          <OrderFormItemDetails
            index={index}
            form={form}
            garmentTypes={garmentTypes}
            shopFabrics={shopFabrics}
            designTypeOptions={designTypeOptions}
            onSelectGarmentType={onSelectGarmentType}
            onSelectFabricSource={onSelectFabricSource}
            onSelectShopFabric={onSelectShopFabric}
            getItemLineTotal={getItemLineTotal}
          />

          <OrderFormItemAddons
            index={index}
            form={form}
            watchedAddons={liveItem?.addons || []}
            onAddAddon={onAddAddon}
            onRemoveAddon={onRemoveAddon}
          />
        </CardContent>
      ) : null}
    </Card>
  );
}
