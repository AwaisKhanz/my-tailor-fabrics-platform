"use client";

import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomerDetailHeader } from "@/components/customers/detail/customer-detail-header";
import { CustomerDetailSkeleton } from "@/components/customers/detail/customer-detail-skeleton";
import { CustomerDetailTabs } from "@/components/customers/detail/customer-detail-tabs";
import { CustomerMeasurementDialog } from "@/components/customers/detail/customer-measurement-dialog";
import { CustomerProfileCard } from "@/components/customers/detail/customer-profile-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCustomerDetailPage } from "@/hooks/use-customer-detail-page";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    loading,
    customer,
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
  } = useCustomerDetailPage({
    customerId: customerId ?? null,
  });

  if (loading) {
    return <CustomerDetailSkeleton />;
  }

  if (!customer) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Customer not found"
        description="The requested customer record is unavailable or was removed."
        action={{
          label: "Back to Customers",
          onClick: () => router.push("/customers"),
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-9xl space-y-6">
      <CustomerDetailHeader
        customer={customer}
        onBack={() => router.push("/customers")}
        onEdit={openEditDialog}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <CustomerProfileCard customer={customer} />
        </div>

        <div className="md:col-span-2">
          <CustomerDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            measurements={customer.measurements || []}
            orders={orders}
            notes={customer.notes}
            getMeasurementLabel={getMeasurementLabel}
            onUpdateMeasurements={openMeasurementDialog}
            onOpenOrder={(orderId) => router.push(`/orders/${orderId}`)}
          />
        </div>
      </div>

      <CustomerDialog
        open={editDialogOpen}
        onOpenChange={closeEditDialog}
        customer={customer}
        onSuccess={() => {
          void fetchCustomerData();
        }}
      />

      <CustomerMeasurementDialog
        open={measurementDialogOpen}
        customerId={customer.id}
        onOpenChange={closeMeasurementDialog}
        onSuccess={() => {
          closeMeasurementDialog(false);
          void fetchCustomerData();
        }}
      />
    </div>
  );
}
