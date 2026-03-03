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
import { DetailSplit, PageShell } from "@/components/ui/page-shell";
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
    <PageShell>
      <CustomerDetailHeader
        customer={customer}
        onBack={() => router.push("/customers")}
        onEdit={openEditDialog}
      />

      <DetailSplit
        ratio="2-1"
        sideClassName="order-1 md:order-none"
        mainClassName="order-2 md:order-none"
        main={
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
        }
        side={<CustomerProfileCard customer={customer} />}
      />

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
    </PageShell>
  );
}
