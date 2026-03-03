import { type CustomerMeasurement, type Order } from "@tbms/shared-types";
import { CustomerMeasurementsTab } from "@/components/customers/detail/customer-measurements-tab";
import { CustomerOrdersTab } from "@/components/customers/detail/customer-orders-tab";
import { CustomerNotesTab } from "@/components/customers/detail/customer-notes-tab";

interface CustomerDetailTabsProps {
  measurements: CustomerMeasurement[];
  orders: Order[];
  notes?: string | null;
  getMeasurementLabel: (categoryId: string, fieldId: string) => string;
  onUpdateMeasurements: () => void;
  onOpenOrder: (orderId: string) => void;
}

export function CustomerDetailTabs({
  measurements,
  orders,
  notes,
  getMeasurementLabel,
  onUpdateMeasurements,
  onOpenOrder,
}: CustomerDetailTabsProps) {
  return (
    <div className="space-y-6">
      <section>
        <CustomerMeasurementsTab
          measurements={measurements}
          getMeasurementLabel={getMeasurementLabel}
          onUpdateMeasurements={onUpdateMeasurements}
        />
      </section>

      <section>
        <CustomerOrdersTab orders={orders} onOpenOrder={onOpenOrder} />
      </section>

      <section>
        <CustomerNotesTab notes={notes} />
      </section>
    </div>
  );
}
