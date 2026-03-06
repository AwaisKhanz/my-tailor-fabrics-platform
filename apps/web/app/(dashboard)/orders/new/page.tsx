"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormStack } from "@/components/ui/form-layout";
import {
  DetailSplit,
  PageShell,
  PageSection,
} from "@/components/ui/page-shell";
import { useOrderFormPage } from "@/hooks/use-order-form-page";
import { OrderFormSkeleton } from "@/components/orders/order-form-skeleton";
import { OrderFormCustomerCard } from "@/components/orders/order-form-customer-card";
import { OrderFormItemsCard } from "@/components/orders/order-form-items-card";
import { OrderFormSummaryCard } from "@/components/orders/order-form-summary-card";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function NewOrderPage() {
  const router = useRouter();

  const {
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
    submitForm,
  } = useOrderFormPage();

  const cancelPath = editOrderId ? `/orders/${editOrderId}` : "/orders";
  const isInitialLoading =
    loading && garmentTypes.length === 0 && customers.length === 0;

  if (isInitialLoading) {
    return <OrderFormSkeleton />;
  }

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title={isEditMode ? "Edit Order" : "Create New Order"}
          description={
            isEditMode
              ? "Update customer, pieces, pricing, and delivery timeline in one focused workflow."
              : "Capture customer details, configure pieces, and finalize pricing before production starts."
          }
          density="compact"
          actions={
            <>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/orders")}
              >
                All Orders
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(cancelPath)}
              >
                {isEditMode ? "Cancel Edit" : "Cancel"}
              </Button>
            </>
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <Form {...form}>
          <FormStack as="form" density="relaxed" onSubmit={submitForm}>
            <DetailSplit
              ratio="3-2"
              sideClassName="lg:sticky lg:top-6 h-fit"
              main={
                <div className="space-y-6">
                  <OrderFormCustomerCard
                    form={form}
                    customers={customers}
                    loading={loading}
                    selectedCustomer={selectedCustomer}
                  />

                  <OrderFormItemsCard
                    form={form}
                    fields={fields}
                    watchedItems={watchedItems}
                    garmentTypes={garmentTypes}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                    onAddAddon={addAddon}
                    onRemoveAddon={removeAddon}
                    onSelectGarmentType={applyGarmentDefaults}
                    getDesignTypeOptions={getAvailableDesignTypes}
                    getItemLineTotal={getItemLineTotal}
                  />
                </div>
              }
              side={
                <OrderFormSummaryCard
                  form={form}
                  totals={totals}
                  itemCount={fields.length}
                  selectedCustomerName={selectedCustomer?.fullName || null}
                  dueDate={watchedDueDate}
                  loading={loading}
                  submitting={submitting}
                  isEditMode={isEditMode}
                />
              }
            />
          </FormStack>
        </Form>
      </PageSection>
    </PageShell>
  );
}

export default withRoleGuard(NewOrderPage, { all: ["orders.create"] });
