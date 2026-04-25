import { Banknote, Clock3, CreditCard, ShoppingBag } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { type CustomerDetail, type CustomerMeasurement, type Order } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatPKR } from "@/lib/utils";
import { CustomerProfileCard } from "@/components/customers/detail/customer-profile-card";

interface CustomerOverviewTabProps {
  customer: CustomerDetail;
  orders: Order[];
  measurements: CustomerMeasurement[];
}

export function CustomerOverviewTab({
  customer,
  orders,
  measurements,
}: CustomerOverviewTabProps) {
  const outstanding = Math.max(
    (customer.stats?.totalSpent ?? 0) - (customer.stats?.totalPaid ?? 0),
    0,
  );
  const latestMeasurementSets = [...measurements]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);
  const latestOrder = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  return (
    <div className="space-y-6">
      <StatsGrid columns="four">
        <StatCard
          title="Total Orders"
          subtitle="All customer orders"
          value={customer.stats?.totalOrders ?? 0}
          tone="primary"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Total Spent"
          subtitle="Non-cancelled booked order value"
          value={formatPKR(customer.stats?.totalSpent ?? 0)}
          tone="success"
          icon={<Banknote className="h-4 w-4" />}
        />
        <StatCard
          title="Payments Received"
          subtitle="Posted collections"
          value={formatPKR(customer.stats?.totalPaid ?? 0)}
          tone="info"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Outstanding"
          subtitle="Active unpaid balance"
          value={formatPKR(outstanding)}
          tone="warning"
          icon={<Clock3 className="h-4 w-4" />}
        />
      </StatsGrid>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <CustomerProfileCard customer={customer} />

        <Card>
          <CardHeader>
            <SectionHeader
              title="Measurement Snapshot"
              description="The most recent sizing profiles ready for quick order capture."
            />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {latestMeasurementSets.length > 0 ? (
              latestMeasurementSets.map((measurement) => (
                <div
                  key={measurement.id}
                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/15 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {measurement.category?.name || "Measurement set"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(measurement.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {Object.keys(measurement.values).length} fields
                  </Badge>
                </div>
              ))
            ) : (
              <InfoTile borderStyle="dashedStrong" padding="contentLg">
                <p className="text-sm text-muted-foreground">
                  No saved measurements yet.
                </p>
              </InfoTile>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Latest Order Activity"
            description="A quick front-desk snapshot of the customer’s latest order."
          />
        </CardHeader>
        <CardContent>
          {latestOrder ? (
            <div className="grid gap-3 rounded-md border bg-muted/10 px-4 py-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Order #</p>
                <p className="mt-1 font-semibold text-foreground">
                  {latestOrder.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <p className="mt-1 font-semibold text-foreground">
                  {ORDER_STATUS_CONFIG[latestOrder.status]?.label ?? latestOrder.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Booked Value</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPKR(latestOrder.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Balance Due</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatPKR(latestOrder.balanceDue)}
                </p>
              </div>
            </div>
          ) : (
            <InfoTile borderStyle="dashedStrong" padding="contentLg">
              <p className="text-sm text-muted-foreground">
                This customer has not placed any orders yet.
              </p>
            </InfoTile>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
