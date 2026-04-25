import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DesignType, GarmentType, ShopFabric } from "@tbms/shared-types";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  CopyPlus,
  Layers3,
  PackagePlus,
  Plus,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";
import { Sortable, SortableItem } from "@tbms/ui/components/reui/sortable";
import { useToast } from "@/hooks/use-toast";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { OrderFormItemCard } from "./order-form-item-card";

interface OrderFormItemsCardProps {
  form: UseFormReturn<OrderFormValues>;
  fields: FieldArrayWithId<OrderFormValues, "items", "id">[];
  watchedItems: OrderFormValues["items"];
  garmentTypes: GarmentType[];
  shopFabrics: ShopFabric[];
  onAddItem: () => void;
  onDuplicateItem: (itemIndex: number, copies?: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onAddAddon: (itemIndex: number) => void;
  onRemoveAddon: (itemIndex: number, addonIndex: number) => void;
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
  onSelectFabricSource: (itemIndex: number, fabricSource: import("@tbms/shared-types").FabricSource) => void;
  onSelectShopFabric: (itemIndex: number, fabricId: string) => void;
  onApplyDesignFromItem: (
    sourceIndex: number,
    targetIndices: number[],
  ) => { updatedCount: number; skippedCount: number };
  onApplyFabricSetupFromItem: (
    sourceIndex: number,
    targetIndices: number[],
  ) => { updatedCount: number };
  getDesignTypeOptions: (garmentTypeId?: string) => DesignType[];
  getItemLineTotal: (item: OrderFormValues["items"][number]) => number;
}

export function OrderFormItemsCard({
  form,
  fields,
  watchedItems,
  garmentTypes,
  shopFabrics,
  onAddItem,
  onDuplicateItem,
  onRemoveItem,
  onMoveItem,
  onAddAddon,
  onRemoveAddon,
  onSelectGarmentType,
  onSelectFabricSource,
  onSelectShopFabric,
  onApplyDesignFromItem,
  onApplyFabricSetupFromItem,
  getDesignTypeOptions,
  getItemLineTotal,
}: OrderFormItemsCardProps) {
  const { toast } = useToast();
  const fieldIds = useMemo(() => fields.map((field) => field.id), [fields]);
  const [expandedIds, setExpandedIds] = useState<string[]>(fieldIds);
  const [addSimilarOpen, setAddSimilarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const previousFieldIdsRef = useRef<string[]>(fieldIds);

  useEffect(() => {
    const previousIds = previousFieldIdsRef.current;
    const newIds = fieldIds.filter((id) => !previousIds.includes(id));

    setExpandedIds((current) => {
      const retainedIds = current.filter((id) => fieldIds.includes(id));

      if (newIds.length === 0) {
        return retainedIds;
      }

      if (fieldIds.length <= 4) {
        return [...retainedIds, ...newIds];
      }

      return fieldIds.slice(-Math.min(2, fieldIds.length));
    });
    setSelectedIds((current) => current.filter((id) => fieldIds.includes(id)));
    previousFieldIdsRef.current = fieldIds;

    if (newIds.length > 0) {
      const newestId = newIds[newIds.length - 1];
      requestAnimationFrame(() => {
        const primaryField = document.querySelector<HTMLElement>(
          `[data-piece-card-id="${newestId}"] [data-piece-primary-field="true"]`,
        );
        if (primaryField) {
          primaryField.scrollIntoView({ behavior: "smooth", block: "center" });
          primaryField.focus();
        }
      });
    }
  }, [fieldIds]);

  const toggleExpanded = useCallback((fieldId: string) => {
    setExpandedIds((current) =>
      current.includes(fieldId)
        ? current.filter((id) => id !== fieldId)
        : [...current, fieldId],
    );
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(fieldIds);
  }, [fieldIds]);

  const collapseAll = useCallback(() => {
    setExpandedIds([]);
  }, []);

  const toggleSelected = useCallback((fieldId: string) => {
    setSelectedIds((current) =>
      current.includes(fieldId)
        ? current.filter((id) => id !== fieldId)
        : [...current, fieldId],
    );
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const allExpanded =
    fields.length > 0 && fields.every((field) => expandedIds.includes(field.id));
  const selectedIndices = selectedIds
    .map((id) => fields.findIndex((field) => field.id === id))
    .filter((index) => index >= 0);
  const templateIndex =
    selectedIndices.length > 0
      ? selectedIndices[selectedIndices.length - 1]
      : null;
  const canRunBulkApply = selectedIndices.length >= 2 && templateIndex !== null;
  const templateLabel =
    templateIndex !== null ? `Piece ${templateIndex + 1}` : "No template";

  const handleApplyDesign = useCallback(() => {
    if (templateIndex === null) {
      return;
    }

    const result = onApplyDesignFromItem(templateIndex, selectedIndices);
    if (result.updatedCount === 0 && result.skippedCount > 0) {
      toast({
        title: "Design not copied",
        description:
          "The selected pieces use different garment rules, so this design could not be reused there.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Design copied",
      description:
        result.skippedCount > 0
          ? `Applied to ${result.updatedCount} piece(s). Skipped ${result.skippedCount} incompatible piece(s).`
          : `Applied to ${result.updatedCount} piece(s) from ${templateLabel}.`,
    });
  }, [onApplyDesignFromItem, selectedIndices, templateIndex, templateLabel, toast]);

  const handleApplyFabric = useCallback(() => {
    if (templateIndex === null) {
      return;
    }

    const result = onApplyFabricSetupFromItem(templateIndex, selectedIndices);
    toast({
      title: "Fabric setup copied",
      description: `Applied the ${templateLabel} fabric setup to ${result.updatedCount} piece(s).`,
    });
  }, [
    onApplyFabricSetupFromItem,
    selectedIndices,
    templateIndex,
    templateLabel,
    toast,
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle>Pieces</CardTitle>
            <Badge variant="secondary" className="font-semibold">
              {fields.length} pieces
            </Badge>
          </div>
          <CardDescription>
            Add one physical piece at a time. Use copy only when several pieces start the same way, then edit the exceptions.
          </CardDescription>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {fields.length > 0 ? (
            <DropdownMenu open={addSimilarOpen} onOpenChange={setAddSimilarOpen}>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  />
                }
              >
                <CopyPlus className="h-4 w-4" />
                Add Similar
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Duplicate Last Piece</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onDuplicateItem(fields.length - 1, 1)}
                    className="cursor-pointer"
                  >
                    <PackagePlus className="h-4 w-4" />
                    Add 1 similar piece
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDuplicateItem(fields.length - 1, 2)}
                    className="cursor-pointer"
                  >
                    <Layers3 className="h-4 w-4" />
                    Add 2 similar pieces
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDuplicateItem(fields.length - 1, 5)}
                    className="cursor-pointer"
                  >
                    <Layers3 className="h-4 w-4" />
                    Add 5 similar pieces
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {fields.length > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={allExpanded ? collapseAll : expandAll}
            >
              {allExpanded ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
              {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
          ) : null}
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
        </div>
      </CardHeader>

      <CardContent>
        {selectedIds.length > 0 ? (
          <div className="mb-4 flex flex-col gap-3 rounded-md border border-dashed px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedIds.length} piece{selectedIds.length === 1 ? "" : "s"} selected
              </p>
              <p className="text-sm text-muted-foreground">
                The most recently selected piece becomes the template: {templateLabel}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyDesign}
                disabled={!canRunBulkApply}
              >
                <WandSparkles className="h-4 w-4" />
                Apply Design
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyFabric}
                disabled={!canRunBulkApply}
              >
                <WandSparkles className="h-4 w-4" />
                Apply Fabric
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearSelected}>
                Clear Selection
              </Button>
            </div>
          </div>
        ) : null}
        {fields.length > 4 ? (
          <div className="mb-4 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            Long order mode is active. Older pieces collapse automatically so the
            newest pieces stay easier to edit.
          </div>
        ) : null}
        <Sortable
          value={fields}
          onValueChange={() => undefined}
          onMove={({ activeIndex, overIndex }) => onMoveItem(activeIndex, overIndex)}
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
              <SortableItem key={field.id} value={field.id} data-piece-card-id={field.id}>
                <OrderFormItemCard
                  index={index}
                  form={form}
                  garmentTypes={garmentTypes}
                  shopFabrics={shopFabrics}
                  designTypeOptions={getDesignTypeOptions(currentItem.garmentTypeId)}
                  getItemLineTotal={getItemLineTotal}
                  expanded={expandedIds.includes(field.id)}
                  selected={selectedIds.includes(field.id)}
                  canRemove={fields.length > 1}
                  canReorder={fields.length > 1}
                  onToggleSelected={() => toggleSelected(field.id)}
                  onToggleExpanded={() => toggleExpanded(field.id)}
                  onSelectGarmentType={onSelectGarmentType}
                  onSelectFabricSource={onSelectFabricSource}
                  onSelectShopFabric={onSelectShopFabric}
                  onDuplicateItem={onDuplicateItem}
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
