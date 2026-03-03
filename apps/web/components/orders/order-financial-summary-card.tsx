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
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardHeader variant="rowSection" density="comfortable" className="items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle variant="dashboard">Financial Summary</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Invoice, received payments, and pending balance.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
        <div className="space-y-3 rounded-lg border border-border/70 bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Subtotal
            </Label>
            <span className="text-sm font-semibold text-foreground">{formatPKR(order.subtotal)}</span>
          </div>

          {order.discountAmount > 0 ? (
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Discount {order.discountType === "PERCENTAGE" ? `(${order.discountValue}%)` : ""}
              </Label>
              <span className="text-sm font-semibold text-success">- {formatPKR(order.discountAmount)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-border/70 pt-3">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Net Invoice
            </Label>
            <span className="text-lg font-bold text-foreground">{formatPKR(order.totalAmount)}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Paid</Label>
            <p className="mt-1 text-lg font-bold text-success">{formatPKR(order.totalPaid)}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Balance</Label>
            <p className="mt-1 text-lg font-bold text-destructive">{formatPKR(order.balanceDue)}</p>
          </div>
        </div>

        <Button
          variant="premium"
          className="h-11 w-full"
          onClick={onCapturePayment}
        >
          Capture Payment
        </Button>
      </CardContent>
    </Card>
  );
}
