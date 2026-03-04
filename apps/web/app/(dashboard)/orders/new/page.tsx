"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, Package2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormStack } from "@/components/ui/form-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { Badge } from "@/components/ui/badge";
import { DetailSplit, PageShell, PageSection } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Typography } from "@/components/ui/typography";
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
        <Card variant="elevatedPanel">
          <CardHeader variant="rowSection" align="startResponsive" gap="md">
            <div className="flex items-center gap-3">
              <SectionIcon size="lg">
                <ClipboardList className="h-4 w-4" />
              </SectionIcon>
              <div>
                <CardTitle variant="section">Order Workflow</CardTitle>
                <CardDescription variant="header">
                  Keep every order consistent from customer selection to final totals.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" size="xs" className="font-bold">
              {isEditMode ? "EDIT ORDER" : "NEW ORDER"}
            </Badge>
          </CardHeader>
          <CardContent spacing="section" padding="inset" className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <InfoTile key={step.title} tone="inputSurface" padding="none" className="px-4 py-3">
                <Label variant="micro">
                  Step {index + 1}
                </Label>
                <Typography as="p" variant="body" className="mt-1 text-sm font-semibold text-foreground">
                  {step.title}
                </Typography>
                <Typography as="p" variant="muted" className="mt-0.5 text-xs">
                  {step.detail}
                </Typography>
              </InfoTile>
            ))}
          </CardContent>
        </Card>
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="three" flushSectionSpacing>
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
        </StatsGrid>
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

export default withRoleGuard(NewOrderPage, { all: ["orders.create"] });
