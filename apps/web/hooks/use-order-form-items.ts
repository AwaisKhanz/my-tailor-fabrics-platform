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
} from "@tbms/shared-types";
import type { OrderFormValues } from "@/types/orders/schemas";

interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  balanceDue: number;
}

const createDefaultOrderItem = (): OrderFormValues["items"][number] => ({
  garmentTypeId: "",
  quantity: 1,
  unitPrice: 0,
  fabricSource: FabricSource.SHOP,
  addons: [],
});

interface UseOrderFormItemsParams {
  form: UseFormReturn<OrderFormValues, unknown, OrderFormValues>;
  garmentTypes: GarmentType[];
  designTypes: DesignType[];
  customers: Customer[];
  watchedItems: OrderFormValues["items"];
  discountType: DiscountType;
  discountValue: number;
  advancePayment: number;
  watchedCustomerId: string;
}

export function useOrderFormItems({
  form,
  garmentTypes,
  designTypes,
  customers,
  watchedItems,
  discountType,
  discountValue,
  advancePayment,
  watchedCustomerId,
}: UseOrderFormItemsParams) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const designTypeMap = useMemo(
    () => new Map(designTypes.map((designType) => [designType.id, designType])),
    [designTypes],
  );

  const getItemLineTotal = useCallback(
    (item: OrderFormValues["items"][number]) => {
      const quantity = Number(item.quantity || 0);
      const itemBase = Number(item.unitPrice || 0) * quantity;
      const designPrice =
        ((designTypeMap.get(item.designTypeId || "")?.defaultPrice || 0) / 100) *
        quantity;
      const addonsTotalPerPiece = (item.addons || []).reduce(
        (total, addon) => total + Number(addon.price || 0),
        0,
      );
      return itemBase + designPrice + addonsTotalPerPiece * quantity;
    },
    [designTypeMap],
  );

  const totals = useMemo<OrderTotals>(() => {
    const subtotal = watchedItems.reduce(
      (total, item) => total + getItemLineTotal(item),
      0,
    );

    const normalizedDiscountValue = Number(discountValue || 0);
    const discountAmount =
      discountType === DiscountType.FIXED
        ? normalizedDiscountValue
        : (subtotal * normalizedDiscountValue) / 100;

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const balanceDue = totalAmount - Number(advancePayment || 0);

    return {
      subtotal,
      discountAmount,
      totalAmount,
      balanceDue,
    };
  }, [
    advancePayment,
    discountType,
    discountValue,
    getItemLineTotal,
    watchedItems,
  ]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === watchedCustomerId) || null,
    [customers, watchedCustomerId],
  );

  const addItem = useCallback(() => {
    append(createDefaultOrderItem());
  }, [append]);

  const removeItem = useCallback(
    (index: number) => {
      if (fields.length <= 1) {
        return;
      }
      remove(index);
    },
    [fields.length, remove],
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
    },
    [form, garmentTypes],
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
    removeItem,
    addAddon,
    removeAddon,
    applyGarmentDefaults,
    getAvailableDesignTypes,
    getItemLineTotal,
  };
}
