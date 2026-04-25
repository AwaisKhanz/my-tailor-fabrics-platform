"use client";

import { useRouter } from "next/navigation";
import { Button } from "@tbms/ui/components/button";
import { Form } from "@tbms/ui/components/form";
import { FormStack } from "@tbms/ui/components/form-layout";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { PageHeader } from "@tbms/ui/components/page-header";
import { ProgressSteps, type Step } from "@tbms/ui/components/progress-steps";
import { OrderFormCustomerCard } from "@/components/orders/order-form-customer-card";
import { OrderFormItemsCard } from "@/components/orders/order-form-items-card";
import { OrderFormReviewCard } from "@/components/orders/order-form-review-card";
import { OrderFormSkeleton } from "@/components/orders/order-form-skeleton";
import { OrderFormSummaryCard } from "@/components/orders/order-form-summary-card";
import { useOrderFormPage } from "@/hooks/use-order-form-page";
import { buildOrderDetailRoute, ORDERS_ROUTE } from "@/lib/order-routes";

export function OrderFormPage() {
  const router = useRouter();
  const {
    form,
    fields,
    loading,
    submitting,
    editOrderId,
    isEditMode,
    currentStep,
    steps,
    garmentTypes,
    customers,
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
    getItemLineTotal,
    goToNextStep,
    goToPreviousStep,
    currentStepCanContinue,
    nextStepLabel,
    currentStepHelperText,
    submitForm,
  } = useOrderFormPage();

  const cancelPath = editOrderId
    ? buildOrderDetailRoute(editOrderId)
    : ORDERS_ROUTE;
  const isInitialLoading =
    loading &&
    garmentTypes.length === 0 &&
    customers.length === 0 &&
    shopFabrics.length === 0;

  if (isInitialLoading) {
    return <OrderFormSkeleton />;
  }

  const stepItems: Step[] = steps.map((label, index) => ({
    label,
    status:
      index < currentStep
        ? "completed"
        : index === currentStep
          ? "current"
          : "pending",
  }));

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title={isEditMode ? "Edit Order" : "Create New Order"}
          description={
            isEditMode
              ? "Update customer, pieces, pricing, and delivery timeline in a clearer piece-first workflow."
              : "Capture customer details, configure physical pieces, and review totals without the usual counter confusion."
          }
          actions={
            <>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(ORDERS_ROUTE)}
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
            <ProgressSteps data={{ steps: stepItems }} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:items-start">
              <div className="space-y-6 xl:col-span-3">
                {currentStep === 0 ? (
                  <OrderFormCustomerCard
                    form={form}
                    customers={customers}
                    loading={loading}
                    selectedCustomer={selectedCustomer}
                  />
                ) : null}

                {currentStep === 1 ? (
                  <OrderFormItemsCard
                    form={form}
                    fields={fields}
                    watchedItems={watchedItems}
                    garmentTypes={garmentTypes}
                    shopFabrics={shopFabrics}
                    onAddItem={addItem}
                    onDuplicateItem={duplicateItem}
                    onRemoveItem={removeItem}
                    onMoveItem={moveItem}
                    onAddAddon={addAddon}
                    onRemoveAddon={removeAddon}
                    onSelectGarmentType={applyGarmentDefaults}
                    onSelectFabricSource={applyFabricSourceDefaults}
                    onSelectShopFabric={applyShopFabricDefaults}
                    onApplyDesignFromItem={applyDesignFromItem}
                    onApplyFabricSetupFromItem={applyFabricSetupFromItem}
                    getDesignTypeOptions={getAvailableDesignTypes}
                    getItemLineTotal={getItemLineTotal}
                  />
                ) : null}

                {currentStep === 2 ? (
                  <OrderFormReviewCard
                    pieceSummaries={pieceSummaries}
                    customerName={selectedCustomer?.fullName || null}
                    dueDate={watchedDueDate}
                  />
                ) : null}
              </div>

              <div className="xl:col-span-2 xl:sticky xl:top-6">
                <OrderFormSummaryCard
                  form={form}
                  totals={totals}
                  itemCount={fields.length}
                  selectedCustomerName={selectedCustomer?.fullName || null}
                  dueDate={watchedDueDate}
                  loading={loading}
                  submitting={submitting}
                  isEditMode={isEditMode}
                  canManageDiscounts={canManageDiscounts}
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  canProceed={currentStepCanContinue}
                  nextStepLabel={nextStepLabel}
                  currentStepHelperText={currentStepHelperText}
                  onBack={goToPreviousStep}
                  onNext={goToNextStep}
                />
              </div>
            </div>
          </FormStack>
        </Form>
      </PageSection>
    </PageShell>
  );
}
