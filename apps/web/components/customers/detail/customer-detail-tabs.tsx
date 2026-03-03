import { type CustomerMeasurement, type Order } from "@tbms/shared-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerMeasurementsTab } from "@/components/customers/detail/customer-measurements-tab";
import { CustomerOrdersTab } from "@/components/customers/detail/customer-orders-tab";
import { CustomerNotesTab } from "@/components/customers/detail/customer-notes-tab";

interface CustomerDetailTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  measurements: CustomerMeasurement[];
  orders: Order[];
  notes?: string | null;
  getMeasurementLabel: (categoryId: string, fieldId: string) => string;
  onUpdateMeasurements: () => void;
  onOpenOrder: (orderId: string) => void;
}

export function CustomerDetailTabs({
  activeTab,
  onTabChange,
  measurements,
  orders,
  notes,
  getMeasurementLabel,
  onUpdateMeasurements,
  onOpenOrder,
}: CustomerDetailTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList variant="premium">
        <TabsTrigger variant="premium" value="measurements">
          Measurements
        </TabsTrigger>
        <TabsTrigger variant="premium" value="orders">
          Order History
        </TabsTrigger>
        <TabsTrigger variant="premium" value="notes">
          Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="measurements">
        <CustomerMeasurementsTab
          measurements={measurements}
          getMeasurementLabel={getMeasurementLabel}
          onUpdateMeasurements={onUpdateMeasurements}
        />
      </TabsContent>

      <TabsContent value="orders">
        <CustomerOrdersTab orders={orders} onOpenOrder={onOpenOrder} />
      </TabsContent>

      <TabsContent value="notes">
        <CustomerNotesTab notes={notes} />
      </TabsContent>
    </Tabs>
  );
}
