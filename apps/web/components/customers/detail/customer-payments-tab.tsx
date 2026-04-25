import { CreditCard, Wallet } from "lucide-react";
import { type CustomerDetail, type Order } from "@tbms/shared-types";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { formatPKR } from "@/lib/utils";

interface CustomerPaymentsTabProps {
  customer: CustomerDetail;
  orders: Order[];
  onOpenOrder: (orderId: string) => void;
}

export function CustomerPaymentsTab({
  customer,
  orders,
  onOpenOrder,
}: CustomerPaymentsTabProps) {
  const paymentRows = orders
    .flatMap((order) =>
      (order.payments ?? [])
        .filter((payment) => !payment.reversedAt)
        .map((payment) => ({
          id: payment.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: payment.amount,
          paidAt: payment.paidAt,
          note: payment.note,
        })),
    )
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  const outstanding = Math.max(
    (customer.stats?.totalSpent ?? 0) - (customer.stats?.totalPaid ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <StatsGrid columns="three">
        <StatCard
          title="Booked Sales"
          subtitle="Non-cancelled booked order value"
          value={formatPKR(customer.stats?.totalSpent ?? 0)}
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Payments Received"
          subtitle="Posted customer collections"
          value={formatPKR(customer.stats?.totalPaid ?? 0)}
          tone="success"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Outstanding Receivables"
          subtitle="Balance still to collect"
          value={formatPKR(outstanding)}
          tone="warning"
          icon={<Wallet className="h-4 w-4" />}
        />
      </StatsGrid>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Recent Posted Payments"
            description="Posted customer collections, with a quick jump back to the source order."
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentRows.length > 0 ? (
            paymentRows.map((payment) => (
              <button
                key={payment.id}
                type="button"
                onClick={() => onOpenOrder(payment.orderId)}
                className="grid w-full gap-3 rounded-md border px-4 py-3 text-left transition-colors hover:bg-muted/30 md:grid-cols-[1.1fr_0.9fr_0.8fr]"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {payment.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.note || "Posted payment"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Paid on</p>
                  <p className="mt-1 font-medium text-foreground">
                    {new Date(payment.paidAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Amount</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatPKR(payment.amount)}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No payments posted yet"
              description="Payments recorded against the customer’s orders will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
