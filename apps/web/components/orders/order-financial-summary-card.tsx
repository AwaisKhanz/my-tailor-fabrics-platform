import { CreditCard } from "lucide-react";
import { Order } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";

interface OrderFinancialSummaryCardProps {
  order: Order;
  onCapturePayment: () => void;
}

export function OrderFinancialSummaryCard({
  order,
  onCapturePayment,
}: OrderFinancialSummaryCardProps) {
  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader variant="section" density="comfortable">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <CardTitle variant="dashboard">Financial Ledger</CardTitle>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5">
        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex justify-between text-xs">
            <Label variant="dashboard" className="opacity-60">
              Base Subtotal
            </Label>
            <span className="font-bold tabular-nums text-foreground">
              {formatPKR(order.subtotal)}
            </span>
          </div>

          {order.discountAmount > 0 ? (
            <div className="flex justify-between text-xs">
              <span className="font-bold uppercase tracking-widest text-success opacity-80">
                Discounts
                {order.discountType === "PERCENTAGE"
                  ? ` (${order.discountValue}%)`
                  : ""}
              </span>
              <span className="font-bold tabular-nums text-success">
                - {formatPKR(order.discountAmount)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="px-1">
          <div className="flex items-end justify-between border-b border-border/30 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-tight text-foreground">
              Net Invoice
            </span>
            <span className="text-3xl font-bold tracking-tight tabular-nums text-primary">
              {formatPKR(order.totalAmount)}
            </span>
          </div>

          {order.totalPaid > 0 ? (
            <div className="mt-3 flex justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Deposits Received</span>
              <span className="text-foreground">{formatPKR(order.totalPaid)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-md bg-primary px-6 py-4 text-primary-foreground shadow-xl shadow-primary/20 ring-1 ring-white/20">
          <span className="text-[10px] font-bold uppercase tracking-tight">
            Balance Pending
          </span>
          <span className="text-2xl font-bold tracking-tight tabular-nums">
            {formatPKR(order.balanceDue)}
          </span>
        </div>

        <Button
          variant="premium"
          size="lg"
          className="h-14 w-full text-xs font-bold uppercase tracking-tight shadow-lg shadow-primary/30"
          onClick={onCapturePayment}
        >
          Capture Payment
        </Button>
      </CardContent>
    </Card>
  );
}
