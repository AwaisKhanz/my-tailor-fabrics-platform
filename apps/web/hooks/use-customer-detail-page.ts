"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type Customer, type CustomerMeasurement, type MeasurementCategory, type Order } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { customerApi } from "@/lib/api/customers";
import { useToast } from "@/hooks/use-toast";

interface CustomerWithMeasurements extends Customer {
  measurements: CustomerMeasurement[];
}

interface UseCustomerDetailPageParams {
  customerId: string | null;
}

export function useCustomerDetailPage({ customerId }: UseCustomerDetailPageParams) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerWithMeasurements | null>(null);
  const [categories, setCategories] = useState<MeasurementCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [activeTab, setActiveTab] = useState("measurements");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);

  const fetchCustomerData = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [customerResponse, categoriesResponse, ordersResponse] = await Promise.all([
        customerApi.getCustomer(customerId),
        configApi.getMeasurementCategories({ limit: 100 }),
        customerApi.getOrders(customerId, { limit: 50 }),
      ]);

      if (customerResponse.success) {
        setCustomer(customerResponse.data);
      } else {
        setCustomer(null);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data?.data ?? []);
      }

      if (ordersResponse.success) {
        setOrders(ordersResponse.data?.data ?? []);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  }, [customerId, router, toast]);

  useEffect(() => {
    void fetchCustomerData();
  }, [fetchCustomerData]);

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
    (categoryId: string, fieldId: string) => {
      return fieldLabelMap.get(categoryId)?.get(fieldId) ?? fieldId.replace(/_/g, " ");
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
    activeTab,
    editDialogOpen,
    measurementDialogOpen,
    setActiveTab,
    getMeasurementLabel,
    openEditDialog,
    closeEditDialog,
    openMeasurementDialog,
    closeMeasurementDialog,
    fetchCustomerData,
  };
}
