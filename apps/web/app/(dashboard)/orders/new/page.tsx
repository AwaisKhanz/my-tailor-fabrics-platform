"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, Package2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormStack } from "@/components/ui/form-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DetailSplit, PageShell, PageSection } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { useOrderFormPage } from "@/hooks/use-order-form-page";
import { OrderFormSkeleton } from "@/components/orders/order-form-skeleton";
import { OrderFormCustomerCard } from "@/components/orders/order-form-customer-card";
import { OrderFormItemsCard } from "@/components/orders/order-form-items-card";
import { OrderFormSummaryCard } from "@/components/orders/order-form-summary-card";

export default function NewOrderPage() {
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
    tailors,
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
  const isInitialLoading = loading && garmentTypes.length === 0 && customers.length === 0;

  if (isInitialLoading) {
    return <OrderFormSkeleton />;
  }

  const workflowSteps = [
    {
      title: "Customer & Timeline",
      detail: "Pick customer and confirm delivery date.",
    },
    {
      title: "Configure Pieces",
      detail: "Set garment, quantity, design, and assignment.",
    },
    {
      title: "Confirm Pricing",
      detail: "Review totals, advance payment, and notes.",
    },
  ];

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
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/orders")}>
                All Orders
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push(cancelPath)}>
                {isEditMode ? "Cancel Edit" : "Cancel"}
              </Button>
            </>
          }
        />
      </PageSection>

      <PageSection spacing="compact">
        <Card className="border-border/70 bg-card/95">
          <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold tracking-tight">Order Workflow</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep every order consistent from customer selection to final totals.
                </p>
              </div>
            </div>
            <Badge variant="outline" size="xs" className="font-bold">
              {isEditMode ? "EDIT ORDER" : "NEW ORDER"}
            </Badge>
          </CardHeader>
          <CardContent spacing="section" className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-border/70 bg-background/50 px-4 py-3">
                <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Step {index + 1}
                </Label>
                <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid auto-rows-fr space-y-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          title="Customer"
          subtitle="Active selection"
          value={selectedCustomer?.fullName || "Select customer"}
          helperText={selectedCustomer?.phone || "No customer selected"}
          tone="info"
          valueClassName="line-clamp-1 text-xl"
          icon={<UserRound className="h-4 w-4" />}
        />

        <StatCard
          title="Pieces"
          subtitle="Order configuration"
          value={fields.length}
          helperText="Configured items"
          tone="warning"
          icon={<Package2 className="h-4 w-4" />}
        />

        <StatCard
          title="Due Date"
          subtitle="Delivery commitment"
          value={watchedDueDate || "Not set"}
          tone="success"
          valueClassName="text-xl"
          icon={<CalendarDays className="h-4 w-4" />}
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
                    tailors={tailors}
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
