"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Package2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="mx-auto max-w-9xl space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Order" : "Create New Order"}
        description={
          isEditMode
            ? "Modify order details, adjust item configuration, and recalculate totals before saving."
            : "Create a new customer order with piece-wise pricing, design charges, and assignment details."
        }
        actions={
          <Button variant="ghost" onClick={() => router.push(cancelPath)}>
            Cancel
          </Button>
        }
      />

      <Card variant="premium" className="border-border/70 bg-muted/10">
        <CardContent className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label variant="dashboard">Mode</Label>
            <Badge variant="outline" size="xs" className="font-bold">
              {isEditMode ? "EDIT EXISTING ORDER" : "CREATE NEW ORDER"}
            </Badge>
          </div>
          <div className="space-y-1">
            <Label variant="dashboard" className="inline-flex items-center gap-1">
              <Package2 className="h-3.5 w-3.5" /> Pieces
            </Label>
            <p className="text-sm font-semibold text-foreground">{fields.length} configured</p>
          </div>
          <div className="space-y-1">
            <Label variant="dashboard" className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Due Date
            </Label>
            <p className="text-sm font-semibold text-foreground">{watchedDueDate || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={submitForm} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <OrderFormCustomerCard
                form={form}
                customers={customers}
                loading={loading}
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

            <div>
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
