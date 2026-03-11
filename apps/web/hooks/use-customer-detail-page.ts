"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type CustomerDetail,
  type CustomerMeasurement,
  type MeasurementCategory,
  type Order,
} from "@tbms/shared-types";
import { CUSTOMERS_ROUTE } from "@/lib/people-routes";
import { useToast } from "@/hooks/use-toast";
import {
  useCustomer,
  useCustomerOrders,
} from "@/hooks/queries/customer-queries";
import { useMeasurementCategories } from "@/hooks/queries/config-queries";

interface UseCustomerDetailPageParams {
  customerId: string | null;
}

export function useCustomerDetailPage({
  customerId,
}: UseCustomerDetailPageParams) {
  const router = useRouter();
  const { toast } = useToast();

  const customerQuery = useCustomer(customerId);
  const categoriesQuery = useMeasurementCategories({ limit: 100 });
  const ordersQuery = useCustomerOrders(customerId, { limit: 50 });

  const loading =
    customerQuery.isLoading ||
    categoriesQuery.isLoading ||
    ordersQuery.isLoading;
  const customer: CustomerDetail | null = customerQuery.data?.success
    ? customerQuery.data.data
    : null;
  const categories: MeasurementCategory[] = categoriesQuery.data?.success
    ? (categoriesQuery.data.data.data ?? [])
    : [];
  const orders: Order[] = ordersQuery.data?.success
    ? (ordersQuery.data.data.data ?? [])
    : [];

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);

  const fetchCustomerData = useCallback(async () => {
    if (!customerId) {
      return;
    }

    try {
      await Promise.all([
        customerQuery.refetch(),
        categoriesQuery.refetch(),
        ordersQuery.refetch(),
      ]);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
      router.push(CUSTOMERS_ROUTE);
    }
  }, [categoriesQuery, customerId, customerQuery, ordersQuery, router, toast]);

  useEffect(() => {
    if (!customerId || !customerQuery.isError) {
      return;
    }
    toast({
      title: "Error",
      description: "Failed to load customer data",
      variant: "destructive",
    });
    router.push(CUSTOMERS_ROUTE);
  }, [customerId, customerQuery.isError, router, toast]);

  const fieldLabelMap = useMemo(() => {
    const categoryMap = new Map<string, Map<string, string>>();

    categories.forEach((category) => {
      const fields = new Map<string, string>();
      category.fields.forEach((field) => {
        fields.set(field.id, field.label);
      });
      categoryMap.set(category.id, fields);
    });

    return categoryMap;
  }, [categories]);

  const getMeasurementLabel = useCallback(
    (measurement: CustomerMeasurement, fieldId: string) => {
      const snapshotLabel = measurement.valuesMeta?.[fieldId]?.label;
      if (snapshotLabel) {
        return snapshotLabel;
      }

      return (
        fieldLabelMap.get(measurement.categoryId)?.get(fieldId) ??
        fieldId.replace(/_/g, " ")
      );
    },
    [fieldLabelMap],
  );

  const openEditDialog = useCallback(() => {
    setEditDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback((open: boolean) => {
    setEditDialogOpen(open);
  }, []);

  const openMeasurementDialog = useCallback(() => {
    setMeasurementDialogOpen(true);
  }, []);

  const closeMeasurementDialog = useCallback((open: boolean) => {
    setMeasurementDialogOpen(open);
  }, []);

  return {
    loading,
    customer,
    categories,
    orders,
    editDialogOpen,
    measurementDialogOpen,
    getMeasurementLabel,
    openEditDialog,
    closeEditDialog,
    openMeasurementDialog,
    closeMeasurementDialog,
    fetchCustomerData,
  };
}
