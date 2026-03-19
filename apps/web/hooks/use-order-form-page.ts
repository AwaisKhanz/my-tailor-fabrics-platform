"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import {
  AddonType,
  CreateOrderInput,
  DesignType,
  DiscountType,
  FabricSource,
  GarmentType,
  OrderItemInput,
  ShopFabric,
  UpdateOrderInput,
} from "@tbms/shared-types";
import { PERMISSION } from "@tbms/shared-constants";
import { typedZodResolver } from "@/lib/utils/form";
import { useOrderFormItems } from "@/hooks/use-order-form-items";
import { useToast } from "@/hooks/use-toast";
import { orderSchema, type OrderFormValues } from "@/types/orders/schemas";
import { useAuthz } from "@/hooks/use-authz";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import { useGarmentTypesList } from "@/hooks/queries/config-queries";
import { useCustomersList } from "@/hooks/queries/customer-queries";
import { useDesignTypesList } from "@/hooks/queries/design-type-queries";
import { useShopFabricsList } from "@/hooks/queries/fabric-queries";
import {
  useCreateOrder,
  useOrder,
  useUpdateOrder,
} from "@/hooks/queries/order-queries";

const ORDER_FORM_STEPS = [
  "Customer & Deadline",
  "Pieces",
  "Review & Payment",
] as const;

const toDateInputValue = (value: Date | string) =>
  new Date(value).toISOString().split("T")[0];

type WatchedOrderItem = Partial<
  Omit<OrderFormValues["items"][number], "addons">
> & {
  addons?: Array<
    Partial<NonNullable<OrderFormValues["items"][number]["addons"]>[number]>
  >;
};

function normalizeWatchedOrderItem(
  item?: WatchedOrderItem,
): OrderFormValues["items"][number] {
  return {
    id: item?.id,
    garmentTypeId: item?.garmentTypeId ?? "",
    quantity: 1,
    unitPrice: Number(item?.unitPrice ?? 0),
    dueDate: item?.dueDate,
    description: item?.description ?? "",
    fabricSource: item?.fabricSource ?? FabricSource.CUSTOMER,
    shopFabricId: item?.shopFabricId ?? undefined,
    shopFabricPrice:
      item?.shopFabricPrice === undefined || item?.shopFabricPrice === null
        ? undefined
        : Number(item.shopFabricPrice),
    customerFabricNote: item?.customerFabricNote ?? "",
    designTypeId: item?.designTypeId ?? undefined,
    addons: (item?.addons ?? []).map((addon) => ({
      type: addon?.type ?? AddonType.EXTRA,
      name: addon?.name ?? "",
      price: Number(addon?.price ?? 0),
    })),
  };
}

function findFirstOrderFormError(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  for (const entry of Object.values(value)) {
    if (!entry) {
      continue;
    }

    if (
      typeof entry === "object" &&
      entry !== null &&
      "message" in entry &&
      typeof entry.message === "string"
    ) {
      return entry.message;
    }

    if (Array.isArray(entry)) {
      for (const nestedValue of entry) {
        const nestedMessage = findFirstOrderFormError(nestedValue);
        if (nestedMessage) {
          return nestedMessage;
        }
      }
      continue;
    }

    const nestedMessage = findFirstOrderFormError(entry);
    if (nestedMessage) {
      return nestedMessage;
    }
  }

  return null;
}

function focusFirstInvalidField() {
  requestAnimationFrame(() => {
    const firstInvalidElement = document.querySelector("[aria-invalid='true']");
    if (firstInvalidElement instanceof HTMLElement) {
      firstInvalidElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      firstInvalidElement.focus();
    }
  });
}

export function useOrderFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canAll } = useAuthz();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const editOrderId = searchParams.get("edit");
  const isEditMode = Boolean(editOrderId);
  const canManageDiscounts = canAll([PERMISSION["orders.financial.manage"]]);

  const garmentTypesQuery = useGarmentTypesList();
  const customersQuery = useCustomersList({ page: 1, limit: 100 });
  const designTypesQuery = useDesignTypesList();
  const shopFabricsQuery = useShopFabricsList({ activeOnly: true, limit: 200 });
  const editOrderQuery = useOrder(editOrderId);
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const garmentTypes: GarmentType[] = garmentTypesQuery.data?.success
    ? garmentTypesQuery.data.data.data
    : [];
  const customers = customersQuery.data?.success
    ? customersQuery.data.data.data || []
    : [];
  const designTypes: DesignType[] = designTypesQuery.data?.success
    ? designTypesQuery.data.data
    : [];
  const shopFabrics: ShopFabric[] = shopFabricsQuery.data?.success
    ? shopFabricsQuery.data.data.data
    : [];

  const loading =
    garmentTypesQuery.isLoading ||
    customersQuery.isLoading ||
    designTypesQuery.isLoading ||
    shopFabricsQuery.isLoading ||
    (isEditMode && editOrderQuery.isLoading);
  const submitting =
    createOrderMutation.isPending || updateOrderMutation.isPending;

  const form = useForm<OrderFormValues, unknown, OrderFormValues>({
    resolver: typedZodResolver(orderSchema),
    defaultValues: {
      customerId: "",
      dueDate: toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      items: [
        {
          garmentTypeId: "",
          quantity: 1,
          unitPrice: 0,
          fabricSource: FabricSource.CUSTOMER,
          customerFabricNote: "",
          addons: [],
        },
      ],
      discountType: DiscountType.FIXED,
      discountValue: 0,
      advancePayment: 0,
      notes: "",
    },
  });

  const watchedForm = useWatch({ control: form.control });
  const watchedItems = (watchedForm?.items ?? []).map((item) =>
    normalizeWatchedOrderItem(item),
  );
  const discountType = useWatch({
    control: form.control,
    name: "discountType",
  });
  const discountValue = useWatch({
    control: form.control,
    name: "discountValue",
  });
  const advancePayment = useWatch({
    control: form.control,
    name: "advancePayment",
  });
  const watchedCustomerId =
    useWatch({
      control: form.control,
      name: "customerId",
    }) ?? "";
  const watchedDueDate =
    useWatch({
      control: form.control,
      name: "dueDate",
    }) ?? "";

  const normalizedDiscountType = discountType ?? DiscountType.FIXED;
  const normalizedDiscountValue = discountValue ?? 0;
  const normalizedAdvancePayment = advancePayment ?? 0;
  const summaryDiscountType = canManageDiscounts ? normalizedDiscountType : undefined;
  const summaryDiscountValue = canManageDiscounts ? normalizedDiscountValue : 0;

  useEffect(() => {
    if (!isEditMode || !editOrderQuery.data?.success) {
      return;
    }

    const order = editOrderQuery.data.data;
    const mappedItems: OrderFormValues["items"] = order.items.map((item) => ({
      id: item.id,
      garmentTypeId: item.garmentTypeId,
      quantity: 1,
      unitPrice: item.unitPrice / 100,
      description: item.description || "",
      fabricSource: item.fabricSource || FabricSource.CUSTOMER,
      shopFabricId: item.shopFabricId || undefined,
      shopFabricPrice:
        item.shopFabricPriceSnapshot !== undefined &&
        item.shopFabricPriceSnapshot !== null
          ? item.shopFabricPriceSnapshot / 100
          : undefined,
      customerFabricNote: item.customerFabricNote || "",
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
  }, [editOrderQuery.data, form, isEditMode]);

  useEffect(() => {
    if (
      garmentTypesQuery.isError ||
      customersQuery.isError ||
      designTypesQuery.isError ||
      shopFabricsQuery.isError ||
      (isEditMode && editOrderQuery.isError)
    ) {
      toast({
        title: "Error",
        description: "Failed to load order data",
        variant: "destructive",
      });
    }
  }, [
    customersQuery.isError,
    designTypesQuery.isError,
    editOrderQuery.isError,
    garmentTypesQuery.isError,
    isEditMode,
    shopFabricsQuery.isError,
    toast,
  ]);

  const {
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
  } = useOrderFormItems({
    form,
    garmentTypes,
    designTypes,
    shopFabrics,
    customers,
    watchedItems,
    discountType: summaryDiscountType,
    discountValue: summaryDiscountValue,
    advancePayment: normalizedAdvancePayment,
    watchedCustomerId,
  });

  const pieceSummaries = useMemo(
    () =>
      watchedItems.map((item, index) => {
        const garment = garmentTypes.find((candidate) => candidate.id === item.garmentTypeId);
        const design = designTypes.find((candidate) => candidate.id === item.designTypeId);
        const selectedFabric = getSelectedShopFabric(item);
        const pricing = getItemPricingBreakdown(item);

        return {
          key: item.id ?? `piece-${index}`,
          label: garment?.name || `Piece ${index + 1}`,
          designLabel: design?.name || "Standard / No Design",
          tailoringTotal: pricing.tailoringTotal,
          designTotal: pricing.designTotal,
          addonTotal: pricing.addonTotal,
          shopFabricTotal: pricing.shopFabricTotal,
          fabricLabel:
            item.fabricSource === FabricSource.SHOP
              ? selectedFabric?.name || "Shop fabric pending"
              : "Customer fabric",
          fabricModeLabel:
            item.fabricSource === FabricSource.SHOP
              ? "Shop fabric"
              : "Customer fabric",
          notes:
            item.fabricSource === FabricSource.CUSTOMER
              ? item.customerFabricNote || item.description || "No fabric note"
              : item.description || "No piece notes",
          total: pricing.total,
        };
      }),
    [
      designTypes,
      garmentTypes,
      getItemPricingBreakdown,
      getSelectedShopFabric,
      watchedItems,
    ],
  );

  const validateStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex === 0) {
        const valid = await form.trigger(["customerId", "dueDate"]);
        if (!valid) {
          toast({
            title: "Complete customer details",
            description: "Select a customer and confirm the due date before continuing.",
            variant: "destructive",
          });
          focusFirstInvalidField();
        }
        return valid;
      }

      if (stepIndex === 1) {
        const valid = await form.trigger("items");
        if (!valid) {
          toast({
            title: "Finish the piece setup",
            description:
              "Each piece needs its garment, pricing, and fabric details before review.",
            variant: "destructive",
          });
          focusFirstInvalidField();
        }
        return valid;
      }

      return true;
    },
    [form, toast],
  );

  const goToNextStep = useCallback(async () => {
    if (currentStep >= ORDER_FORM_STEPS.length - 1) {
      return;
    }

    const isValid = await validateStep(currentStep);
    if (!isValid) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, ORDER_FORM_STEPS.length - 1));
  }, [currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const onSubmit = useCallback(
    async (values: OrderFormValues) => {
      try {
        const mappedItems: OrderItemInput[] = values.items.map((item) => ({
          id: item.id,
          garmentTypeId: item.garmentTypeId,
          quantity: 1,
          unitPrice: Number(item.unitPrice || 0),
          description: item.description,
          fabricSource: item.fabricSource,
          shopFabricId: item.shopFabricId || null,
          shopFabricPrice:
            item.fabricSource === FabricSource.SHOP &&
            item.shopFabricPrice !== undefined &&
            item.shopFabricPrice !== null
              ? Number(item.shopFabricPrice)
              : null,
          customerFabricNote:
            item.fabricSource === FabricSource.CUSTOMER
              ? item.customerFabricNote || item.description || null
              : null,
          designTypeId: item.designTypeId || null,
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
          const response = await updateOrderMutation.mutateAsync({
            id: editOrderId,
            data: payload,
          });
          if (response.success) {
            toast({
              title: "Order Updated",
              description: "The order has been modified successfully.",
            });
            router.push(buildOrderDetailRoute(editOrderId));
            return;
          }

          toast({
            title: "Order could not be updated",
            description: "The server did not confirm the order update.",
            variant: "destructive",
          });
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

        const response = await createOrderMutation.mutateAsync(payload);
        if (response.success) {
          toast({
            title: "Order Created",
            description: `Order #${response.data.orderNumber} successfully created.`,
          });
          router.push(buildOrderDetailRoute(response.data.id));
          return;
        }

        toast({
          title: "Order could not be created",
          description: "The server did not confirm the order creation.",
          variant: "destructive",
        });
      } catch {
        toast({
          title: "Error",
          description: `Failed to ${editOrderId ? "update" : "create"} order`,
          variant: "destructive",
        });
      }
    },
    [
      canManageDiscounts,
      createOrderMutation,
      editOrderId,
      router,
      toast,
      updateOrderMutation,
    ],
  );

  const onInvalid = useCallback(
    (errors: FieldErrors<OrderFormValues>) => {
      const description =
        findFirstOrderFormError(errors) ||
        "Review the highlighted order fields and try again.";

      toast({
        title: "Order form is incomplete",
        description,
        variant: "destructive",
      });

      focusFirstInvalidField();
    },
    [toast],
  );

  return {
    form,
    fields,
    loading,
    submitting,
    editOrderId,
    isEditMode,
    currentStep,
    steps: ORDER_FORM_STEPS,
    garmentTypes,
    customers,
    designTypes,
    shopFabrics,
    totals,
    pieceSummaries,
    selectedCustomer,
    watchedDueDate,
    watchedItems,
    canManageDiscounts,
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
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
    submitForm: form.handleSubmit(onSubmit, onInvalid),
  };
}
