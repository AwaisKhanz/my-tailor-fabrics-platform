"use client";

import { AlertCircle, Banknote, Ruler, ShoppingBag, Wallet } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomerDetailBreadcrumb } from "@/components/customers/detail/customer-detail-breadcrumb";
import { CustomerDetailHeader } from "@/components/customers/detail/customer-detail-header";
import { CustomerDetailSkeleton } from "@/components/customers/detail/customer-detail-skeleton";
import { CustomerDetailTabs } from "@/components/customers/detail/customer-detail-tabs";
import { CustomerMeasurementDialog } from "@/components/customers/detail/customer-measurement-dialog";
import { CustomerProfileCard } from "@/components/customers/detail/customer-profile-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DetailSplit, PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { formatPKR } from "@/lib/utils";
import { useCustomerDetailPage } from "@/hooks/use-customer-detail-page";
import { useAuthz } from "@/hooks/use-authz";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { canAll } = useAuthz();
  const canEditCustomer = canAll([PERMISSION["customers.update"]]);
  const canManageMeasurements = canAll([PERMISSION["customers.measurements.manage"]]);

  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    loading,
    customer,
    orders,
    editDialogOpen,
    measurementDialogOpen,
    getMeasurementLabel,
    openEditDialog,
    closeEditDialog,
    openMeasurementDialog,
    closeMeasurementDialog,
    fetchCustomerData,
  } = useCustomerDetailPage({
    customerId: customerId ?? null,
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
            onClick: () => router.push("/customers"),
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
          onBack={() => router.push("/customers")}
        />
        <CustomerDetailHeader
          customer={customer}
          canEditProfile={canEditCustomer}
          onEdit={openEditDialog}
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="four" flushSectionSpacing>
          <StatCard
            title="Total Orders"
            subtitle="Order history count"
            value={customer.stats?.totalOrders ?? 0}
            tone="primary"
            icon={<ShoppingBag className="h-4 w-4" />}
          />

          <StatCard
            title="Total Spent"
            subtitle="Confirmed transactions"
            value={formatPKR(customer.stats?.totalSpent ?? 0)}
            tone="success"
            icon={<Banknote className="h-4 w-4" />}
          />

          <StatCard
            title="Lifetime Value"
            subtitle="Customer contribution"
            value={formatPKR(customer.lifetimeValue)}
            tone="info"
            icon={<Wallet className="h-4 w-4" />}
          />

          <StatCard
            title="Measurement Sets"
            subtitle="Saved sizing profiles"
            value={customer.measurements?.length ?? 0}
            tone="warning"
            icon={<Ruler className="h-4 w-4" />}
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <DetailSplit
          ratio="3-2"
          sideClassName="order-1 md:order-none"
          mainClassName="order-2 md:order-none"
          main={
            <CustomerDetailTabs
              measurements={customer.measurements || []}
              orders={orders}
              notes={customer.notes}
              getMeasurementLabel={getMeasurementLabel}
              onUpdateMeasurements={openMeasurementDialog}
              onOpenOrder={(orderId) => router.push(`/orders/${orderId}`)}
              canUpdateMeasurements={canManageMeasurements}
            />
          }
          side={<CustomerProfileCard customer={customer} />}
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
          onSuccess={() => {
            closeMeasurementDialog(false);
            refreshCustomerData();
          }}
        />
      ) : null}
    </PageShell>
  );
}

export default withRoleGuard(CustomerDetailPage, { all: [PERMISSION["customers.read"]] });
