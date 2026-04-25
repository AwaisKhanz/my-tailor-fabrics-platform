import { type CustomerDetail, type CustomerMeasurement, type Order } from "@tbms/shared-types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tbms/ui/components/tabs";
import { CustomerOverviewTab } from "@/components/customers/detail/customer-overview-tab";
import { CustomerMeasurementsTab } from "@/components/customers/detail/customer-measurements-tab";
import { CustomerOrdersTab } from "@/components/customers/detail/customer-orders-tab";
import { CustomerPaymentsTab } from "@/components/customers/detail/customer-payments-tab";

interface CustomerDetailTabsProps {
  customer: CustomerDetail;
  measurements: CustomerMeasurement[];
  orders: Order[];
  getMeasurementLabel: (
    measurement: CustomerMeasurement,
    fieldId: string,
  ) => string;
  onUpdateMeasurements: () => void;
  onEditMeasurement: (measurement: CustomerMeasurement) => void;
  onOpenOrder: (orderId: string) => void;
  canUpdateMeasurements?: boolean;
}

export function CustomerDetailTabs({
  customer,
  measurements,
  orders,
  getMeasurementLabel,
  onUpdateMeasurements,
  onEditMeasurement,
  onOpenOrder,
  canUpdateMeasurements = true,
}: CustomerDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <TabsList variant="line" className="min-w-max">
          <TabsTrigger value="overview" className="px-3 py-2 text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="measurements" className="px-3 py-2 text-sm">
            Measurements
          </TabsTrigger>
          <TabsTrigger value="orders" className="px-3 py-2 text-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="payments" className="px-3 py-2 text-sm">
            Payments
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0">
        <CustomerOverviewTab
          customer={customer}
          orders={orders}
          measurements={measurements}
        />
      </TabsContent>

      <TabsContent value="measurements" className="mt-0">
        <CustomerMeasurementsTab
          measurements={measurements}
          getMeasurementLabel={getMeasurementLabel}
          onUpdateMeasurements={onUpdateMeasurements}
          onEditMeasurement={onEditMeasurement}
          canUpdateMeasurements={canUpdateMeasurements}
        />
      </TabsContent>

      <TabsContent value="orders" className="mt-0">
        <CustomerOrdersTab orders={orders} onOpenOrder={onOpenOrder} />
      </TabsContent>

      <TabsContent value="payments" className="mt-0">
        <CustomerPaymentsTab
          customer={customer}
          orders={orders}
          onOpenOrder={onOpenOrder}
        />
      </TabsContent>
    </Tabs>
  );
}
