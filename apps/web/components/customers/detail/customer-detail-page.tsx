"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomerDetailBreadcrumb } from "@/components/customers/detail/customer-detail-breadcrumb";
import { CustomerDetailHeader } from "@/components/customers/detail/customer-detail-header";
import { CustomerDetailSkeleton } from "@/components/customers/detail/customer-detail-skeleton";
import { CustomerDetailTabs } from "@/components/customers/detail/customer-detail-tabs";
import { CustomerMeasurementDialog } from "@/components/customers/detail/customer-measurement-dialog";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { useCustomerDetailPage } from "@/hooks/use-customer-detail-page";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import { CUSTOMERS_ROUTE } from "@/lib/people-routes";
import { PERMISSION } from "@tbms/shared-constants";

type CustomerDetailPageProps = {
  customerId: string;
};

export function CustomerDetailPage({
  customerId,
}: CustomerDetailPageProps) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canEditCustomer = canAll([PERMISSION["customers.update"]]);
  const canManageMeasurements = canAll([
    PERMISSION["customers.measurements.manage"],
  ]);

  const {
    loading,
    customer,
    orders,
    editDialogOpen,
    measurementDialogOpen,
    measurementDialogInitialCategoryId,
    measurementDialogInitialValues,
    getMeasurementLabel,
    openEditDialog,
    closeEditDialog,
    openMeasurementDialog,
    closeMeasurementDialog,
    fetchCustomerData,
  } = useCustomerDetailPage({
    customerId,
  });

  const refreshCustomerData = () => {
    void fetchCustomerData();
  };

  if (loading) {
    return <CustomerDetailSkeleton />;
  }

  if (!customer) {
    return (
      <PageShell>
        <EmptyState
          icon={AlertCircle}
          title="Customer not found"
          description="The requested customer record is unavailable or was removed."
          action={{
            label: "Back to Customers",
            onClick: () => router.push(CUSTOMERS_ROUTE),
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageSection spacing="compact">
        <CustomerDetailBreadcrumb
          sizeNumber={customer.sizeNumber}
          onBack={() => router.push(CUSTOMERS_ROUTE)}
        />
        <CustomerDetailHeader
          customer={customer}
          canEditProfile={canEditCustomer}
          onEdit={openEditDialog}
        />
      </PageSection>

      <PageSection spacing="compact">
        <CustomerDetailTabs
          customer={customer}
          measurements={customer.measurements || []}
          orders={orders}
          getMeasurementLabel={getMeasurementLabel}
          onUpdateMeasurements={openMeasurementDialog}
          onEditMeasurement={openMeasurementDialog}
          onOpenOrder={(orderId) => router.push(buildOrderDetailRoute(orderId))}
          canUpdateMeasurements={canManageMeasurements}
        />
      </PageSection>

      {canEditCustomer ? (
        <CustomerDialog
          open={editDialogOpen}
          onOpenChange={closeEditDialog}
          customer={customer}
          onSuccess={refreshCustomerData}
        />
      ) : null}

      {canManageMeasurements ? (
        <CustomerMeasurementDialog
          open={measurementDialogOpen}
          customerId={customer.id}
          onOpenChange={closeMeasurementDialog}
          initialCategoryId={measurementDialogInitialCategoryId}
          initialValues={measurementDialogInitialValues}
          measurements={customer.measurements || []}
          onSuccess={() => {
            closeMeasurementDialog(false);
            refreshCustomerData();
          }}
        />
      ) : null}
    </PageShell>
  );
}
