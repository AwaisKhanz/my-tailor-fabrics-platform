"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import {
  AddonType,
  CreateOrderInput,
  Customer,
  DesignType,
  DiscountType,
  FabricSource,
  GarmentType,
  UpdateOrderInput,
} from "@tbms/shared-types";
import { typedZodResolver } from "@/lib/utils/form";
import { useToast } from "@/hooks/use-toast";
import { orderSchema, type OrderFormValues } from "@/types/orders/schemas";
import { configApi } from "@/lib/api/config";
import { customerApi } from "@/lib/api/customers";
import { designTypesApi } from "@/lib/api/design-types";
import { ordersApi } from "@/lib/api/orders";
import { useAuthz } from "@/hooks/use-authz";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import { PERMISSION } from '@tbms/shared-constants';

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

const toDateInputValue = (value: Date | string) =>
  new Date(value).toISOString().split("T")[0];

export function useOrderFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canAll } = useAuthz();
  const { toast } = useToast();

  const editOrderId = searchParams.get("edit");
  const isEditMode = Boolean(editOrderId);
  const canManageDiscounts = canAll([PERMISSION["orders.financial.manage"]]);

  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [designTypes, setDesignTypes] = useState<DesignType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OrderFormValues, unknown, OrderFormValues>({
    resolver: typedZodResolver(orderSchema),
    defaultValues: {
      customerId: "",
      dueDate: toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      items: [createDefaultOrderItem()],
      discountType: DiscountType.FIXED,
      discountValue: 0,
      advancePayment: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");
  const advancePayment = form.watch("advancePayment");
  const watchedCustomerId = form.watch("customerId");
  const watchedDueDate = form.watch("dueDate");

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [garmentsResponse, customersResponse, designTypesResponse] =
          await Promise.all([
            configApi.getGarmentTypes(),
            customerApi.getCustomers({ page: 1, limit: 100 }),
            designTypesApi.findAll(),
          ]);

        if (isCancelled) {
          return;
        }

        if (garmentsResponse.success) {
          setGarmentTypes(garmentsResponse.data.data);
        }

        if (customersResponse.success) {
          setCustomers(customersResponse.data.data || []);
        }

        if (designTypesResponse.success) {
          setDesignTypes(designTypesResponse.data);
        }

        if (!editOrderId) {
          return;
        }

        const orderResponse = await ordersApi.getOrder(editOrderId);
        if (!orderResponse.success || isCancelled) {
          return;
        }

        const order = orderResponse.data;
        const mappedItems: OrderFormValues["items"] = order.items.map((item) => ({
          id: item.id,
          garmentTypeId: item.garmentTypeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice / 100,
          description: item.description || "",
          fabricSource: item.fabricSource || FabricSource.SHOP,
          designTypeId: item.designTypeId || undefined,
          addons:
            item.addons?.map((addon) => ({
              type: addon.type,
              name: addon.name,
              price: addon.price / 100,
            })) || [],
        }));

        form.reset({
          customerId: order.customerId,
          dueDate: toDateInputValue(order.dueDate),
          items: mappedItems,
          discountType: order.discountType || DiscountType.FIXED,
          discountValue: order.discountValue / 100,
          advancePayment: order.totalPaid / 100,
          notes: order.notes || "",
        });
      } catch {
        if (!isCancelled) {
          toast({
            title: "Error",
            description: "Failed to load order data",
            variant: "destructive",
          });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, [editOrderId, form, toast]);

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
    const subtotal = watchedItems.reduce((total, item) => total + getItemLineTotal(item), 0);

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
  }, [watchedItems, getItemLineTotal, discountType, discountValue, advancePayment]);

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

      const selectedGarment = garmentTypes.find((garment) => garment.id === garmentTypeId);
      if (!selectedGarment) {
        return;
      }

      form.setValue(`items.${itemIndex}.unitPrice`, selectedGarment.customerPrice / 100, {
        shouldDirty: true,
      });
    },
    [form, garmentTypes],
  );

  const getAvailableDesignTypes = useCallback(
    (garmentTypeId?: string) =>
      designTypes.filter(
        (designType) => !designType.garmentTypeId || designType.garmentTypeId === garmentTypeId,
      ),
    [designTypes],
  );

  const onSubmit = useCallback(
    async (values: OrderFormValues) => {
      setSubmitting(true);

      try {
        const mappedItems = values.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice || 0),
          addons: item.addons?.map((addon) => ({
            ...addon,
            price: Number(addon.price || 0),
          })),
        }));

        const discountPayload = canManageDiscounts
          ? {
              discountType: values.discountType,
              discountValue: Number(values.discountValue || 0),
            }
          : {};

        if (editOrderId) {
          const payload: UpdateOrderInput = {
            dueDate: values.dueDate,
            notes: values.notes,
            items: mappedItems,
            ...discountPayload,
          };
          const response = await ordersApi.updateOrder(editOrderId, payload);
          if (response.success) {
            toast({
              title: "Order Updated",
              description: "The order has been modified successfully.",
            });
            router.push(buildOrderDetailRoute(editOrderId));
          }
          return;
        }

        const payload: CreateOrderInput = {
          customerId: values.customerId,
          dueDate: values.dueDate,
          notes: values.notes,
          items: mappedItems,
          advancePayment: Number(values.advancePayment || 0),
          ...discountPayload,
        };

        const response = await ordersApi.createOrder(payload);
        if (response.success) {
          toast({
            title: "Order Created",
            description: `Order #${response.data.orderNumber} successfully created.`,
          });
          router.push(buildOrderDetailRoute(response.data.id));
        }
      } catch {
        toast({
          title: "Error",
          description: `Failed to ${editOrderId ? "update" : "create"} order`,
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [canManageDiscounts, editOrderId, router, toast],
  );

  return {
    form,
    fields,
    loading,
    submitting,
    editOrderId,
    isEditMode,
    garmentTypes,
    customers,
    totals,
    selectedCustomer,
    watchedDueDate,
    watchedItems,
    addItem,
    removeItem,
    addAddon,
    removeAddon,
    applyGarmentDefaults,
    getAvailableDesignTypes,
    getItemLineTotal,
    submitForm: form.handleSubmit(onSubmit),
  };
}
