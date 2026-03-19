"use client";

import { useCallback, useMemo } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  AddonType,
  Customer,
  DesignType,
  DiscountType,
  FabricSource,
  GarmentType,
  ShopFabric,
} from "@tbms/shared-types";
import type { OrderFormValues } from "@/types/orders/schemas";

interface OrderTotals {
  tailoringSubtotal: number;
  designSubtotal: number;
  addonSubtotal: number;
  shopFabricSubtotal: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  balanceDue: number;
  customerFabricPieces: number;
  shopFabricPieces: number;
}

const createDefaultOrderItem = (): OrderFormValues["items"][number] => ({
  garmentTypeId: "",
  quantity: 1,
  unitPrice: 0,
  fabricSource: FabricSource.CUSTOMER,
  addons: [],
  customerFabricNote: "",
});

interface UseOrderFormItemsParams {
  form: UseFormReturn<OrderFormValues, unknown, OrderFormValues>;
  garmentTypes: GarmentType[];
  designTypes: DesignType[];
  shopFabrics: ShopFabric[];
  customers: Customer[];
  watchedItems: OrderFormValues["items"];
  discountType?: DiscountType;
  discountValue: number;
  advancePayment: number;
  watchedCustomerId: string;
}

export function useOrderFormItems({
  form,
  garmentTypes,
  designTypes,
  shopFabrics,
  customers,
  watchedItems,
  discountType,
  discountValue,
  advancePayment,
  watchedCustomerId,
}: UseOrderFormItemsParams) {
  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const designTypeMap = useMemo(
    () => new Map(designTypes.map((designType) => [designType.id, designType])),
    [designTypes],
  );
  const shopFabricMap = useMemo(
    () => new Map(shopFabrics.map((fabric) => [fabric.id, fabric])),
    [shopFabrics],
  );

  const getSelectedShopFabric = useCallback(
    (item: OrderFormValues["items"][number]) => {
      return item.shopFabricId ? shopFabricMap.get(item.shopFabricId) ?? null : null;
    },
    [shopFabricMap],
  );

  const getItemPricingBreakdown = useCallback(
    (item: OrderFormValues["items"][number]) => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const tailoringTotal = Number(item.unitPrice || 0) * quantity;
      const designTotal =
        ((designTypeMap.get(item.designTypeId || "")?.defaultPrice || 0) / 100) *
        quantity;
      const addonTotal = (item.addons || []).reduce(
        (total, addon) => total + Number(addon.price || 0),
        0,
      );
      const selectedFabric = getSelectedShopFabric(item);
      const shopFabricPrice =
        item.shopFabricPrice ??
        (selectedFabric ? selectedFabric.sellingRate / 100 : 0);
      const shopFabricTotal =
        item.fabricSource === FabricSource.SHOP
          ? Number(shopFabricPrice || 0)
          : 0;

      return {
        tailoringTotal,
        designTotal,
        addonTotal,
        shopFabricPrice,
        shopFabricTotal,
        total: tailoringTotal + designTotal + addonTotal + shopFabricTotal,
      };
    },
    [designTypeMap, getSelectedShopFabric],
  );

  const getItemLineTotal = useCallback(
    (item: OrderFormValues["items"][number]) => {
      return getItemPricingBreakdown(item).total;
    },
    [getItemPricingBreakdown],
  );

  const totals = useMemo<OrderTotals>(() => {
    const breakdowns = watchedItems.map((item) => ({
      item,
      breakdown: getItemPricingBreakdown(item),
    }));

    const tailoringSubtotal = breakdowns.reduce(
      (total, current) => total + current.breakdown.tailoringTotal,
      0,
    );
    const designSubtotal = breakdowns.reduce(
      (total, current) => total + current.breakdown.designTotal,
      0,
    );
    const addonSubtotal = breakdowns.reduce(
      (total, current) => total + current.breakdown.addonTotal,
      0,
    );
    const shopFabricSubtotal = breakdowns.reduce(
      (total, current) => total + current.breakdown.shopFabricTotal,
      0,
    );
    const subtotal =
      tailoringSubtotal + designSubtotal + addonSubtotal + shopFabricSubtotal;

    const normalizedDiscountValue = Number(discountValue || 0);
    const discountAmount =
      discountType === undefined
        ? 0
        : discountType === DiscountType.FIXED
          ? normalizedDiscountValue
          : (subtotal * normalizedDiscountValue) / 100;

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const balanceDue = Math.max(0, totalAmount - Number(advancePayment || 0));

    return {
      tailoringSubtotal,
      designSubtotal,
      addonSubtotal,
      shopFabricSubtotal,
      subtotal,
      discountAmount,
      totalAmount,
      balanceDue,
      customerFabricPieces: watchedItems.filter(
        (item) => item.fabricSource === FabricSource.CUSTOMER,
      ).length,
      shopFabricPieces: watchedItems.filter(
        (item) => item.fabricSource === FabricSource.SHOP,
      ).length,
    };
  }, [
    advancePayment,
    discountType,
    discountValue,
    getItemPricingBreakdown,
    watchedItems,
  ]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === watchedCustomerId) || null,
    [customers, watchedCustomerId],
  );

  const addItem = useCallback(() => {
    append(createDefaultOrderItem());
  }, [append]);

  const duplicateItem = useCallback(
    (index: number, copies = 1) => {
      const source = form.getValues(`items.${index}`);
      const duplicateCount = Math.max(1, Math.floor(copies));
      const clones = Array.from({ length: duplicateCount }, () => ({
        ...source,
        id: undefined,
        quantity: 1,
        addons: (source.addons || []).map((addon) => ({ ...addon })),
      }));

      insert(index + 1, clones);
    },
    [form, insert],
  );

  const removeItem = useCallback(
    (index: number) => {
      if (fields.length <= 1) {
        return;
      }
      remove(index);
    },
    [fields.length, remove],
  );

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < 0 || toIndex < 0) {
        return;
      }
      if (fromIndex >= fields.length || toIndex >= fields.length) {
        return;
      }
      move(fromIndex, toIndex);
    },
    [fields.length, move],
  );

  const addAddon = useCallback(
    (itemIndex: number) => {
      const currentAddons = form.getValues(`items.${itemIndex}.addons`) || [];
      form.setValue(
        `items.${itemIndex}.addons`,
        [...currentAddons, { type: AddonType.EXTRA, name: "", price: 0 }],
        { shouldDirty: true },
      );
    },
    [form],
  );

  const removeAddon = useCallback(
    (itemIndex: number, addonIndex: number) => {
      const currentAddons = form.getValues(`items.${itemIndex}.addons`) || [];
      form.setValue(
        `items.${itemIndex}.addons`,
        currentAddons.filter((_, index) => index !== addonIndex),
        { shouldDirty: true },
      );
    },
    [form],
  );

  const applyGarmentDefaults = useCallback(
    (itemIndex: number, garmentTypeId: string) => {
      form.setValue(`items.${itemIndex}.garmentTypeId`, garmentTypeId, {
        shouldDirty: true,
      });

      const selectedGarment = garmentTypes.find(
        (garment) => garment.id === garmentTypeId,
      );
      if (!selectedGarment) {
        return;
      }

      form.setValue(
        `items.${itemIndex}.unitPrice`,
        selectedGarment.customerPrice / 100,
        {
          shouldDirty: true,
        },
      );

      const currentDesignTypeId = form.getValues(`items.${itemIndex}.designTypeId`);
      const allowedDesignIds = new Set(
        designTypes
          .filter(
            (designType) =>
              !designType.garmentTypeId || designType.garmentTypeId === garmentTypeId,
          )
          .map((designType) => designType.id),
      );

      if (currentDesignTypeId && !allowedDesignIds.has(currentDesignTypeId)) {
        form.setValue(`items.${itemIndex}.designTypeId`, undefined, {
          shouldDirty: true,
        });
      }
    },
    [designTypes, form, garmentTypes],
  );

  const applyFabricSourceDefaults = useCallback(
    (itemIndex: number, fabricSource: FabricSource) => {
      form.setValue(`items.${itemIndex}.fabricSource`, fabricSource, {
        shouldDirty: true,
      });

      if (fabricSource === FabricSource.CUSTOMER) {
        form.setValue(`items.${itemIndex}.shopFabricId`, undefined, {
          shouldDirty: true,
        });
        form.setValue(`items.${itemIndex}.shopFabricPrice`, undefined, {
          shouldDirty: true,
        });
        return;
      }

      form.setValue(`items.${itemIndex}.customerFabricNote`, "", {
        shouldDirty: true,
      });
    },
    [form],
  );

  const applyShopFabricDefaults = useCallback(
    (itemIndex: number, fabricId: string) => {
      if (!fabricId) {
        form.setValue(`items.${itemIndex}.shopFabricId`, undefined, {
          shouldDirty: true,
        });
        form.setValue(`items.${itemIndex}.shopFabricPrice`, undefined, {
          shouldDirty: true,
        });
        return;
      }

      const selectedFabric = shopFabricMap.get(fabricId);
      form.setValue(`items.${itemIndex}.shopFabricId`, fabricId, {
        shouldDirty: true,
      });

      if (!selectedFabric) {
        return;
      }

      form.setValue(
        `items.${itemIndex}.shopFabricPrice`,
        selectedFabric.sellingRate / 100,
        {
          shouldDirty: true,
        },
      );
    },
    [form, shopFabricMap],
  );

  const applyDesignFromItem = useCallback(
    (sourceIndex: number, targetIndices: number[]) => {
      const sourceDesignTypeId = form.getValues(`items.${sourceIndex}.designTypeId`);
      let updatedCount = 0;
      let skippedCount = 0;

      for (const targetIndex of targetIndices) {
        if (targetIndex === sourceIndex) {
          continue;
        }

        const targetGarmentTypeId = form.getValues(`items.${targetIndex}.garmentTypeId`);
        if (!sourceDesignTypeId) {
          form.setValue(`items.${targetIndex}.designTypeId`, undefined, {
            shouldDirty: true,
          });
          updatedCount += 1;
          continue;
        }

        const designAllowed = designTypes.some(
          (designType) =>
            designType.id === sourceDesignTypeId &&
            (!designType.garmentTypeId ||
              designType.garmentTypeId === targetGarmentTypeId),
        );

        if (!designAllowed) {
          skippedCount += 1;
          continue;
        }

        form.setValue(`items.${targetIndex}.designTypeId`, sourceDesignTypeId, {
          shouldDirty: true,
        });
        updatedCount += 1;
      }

      return { updatedCount, skippedCount };
    },
    [designTypes, form],
  );

  const applyFabricSetupFromItem = useCallback(
    (sourceIndex: number, targetIndices: number[]) => {
      const sourceItem = form.getValues(`items.${sourceIndex}`);
      let updatedCount = 0;

      for (const targetIndex of targetIndices) {
        if (targetIndex === sourceIndex) {
          continue;
        }

        form.setValue(`items.${targetIndex}.fabricSource`, sourceItem.fabricSource, {
          shouldDirty: true,
        });

        if (sourceItem.fabricSource === FabricSource.SHOP) {
          form.setValue(
            `items.${targetIndex}.shopFabricId`,
            sourceItem.shopFabricId || undefined,
            { shouldDirty: true },
          );
          form.setValue(
            `items.${targetIndex}.shopFabricPrice`,
            sourceItem.shopFabricPrice ?? undefined,
            { shouldDirty: true },
          );
          form.setValue(`items.${targetIndex}.customerFabricNote`, "", {
            shouldDirty: true,
          });
        } else {
          form.setValue(`items.${targetIndex}.shopFabricId`, undefined, {
            shouldDirty: true,
          });
          form.setValue(`items.${targetIndex}.shopFabricPrice`, undefined, {
            shouldDirty: true,
          });
          form.setValue(
            `items.${targetIndex}.customerFabricNote`,
            sourceItem.customerFabricNote || "",
            { shouldDirty: true },
          );
        }

        updatedCount += 1;
      }

      return { updatedCount };
    },
    [form],
  );

  const getAvailableDesignTypes = useCallback(
    (garmentTypeId?: string) =>
      designTypes.filter(
        (designType) =>
          !designType.garmentTypeId || designType.garmentTypeId === garmentTypeId,
      ),
    [designTypes],
  );

  return {
    fields,
    totals,
    selectedCustomer,
    addItem,
    duplicateItem,
    removeItem,
    moveItem,
    addAddon,
    removeAddon,
    applyGarmentDefaults,
    applyFabricSourceDefaults,
    applyShopFabricDefaults,
    applyDesignFromItem,
    applyFabricSetupFromItem,
    getAvailableDesignTypes,
    getSelectedShopFabric,
    getItemPricingBreakdown,
    getItemLineTotal,
  };
}
