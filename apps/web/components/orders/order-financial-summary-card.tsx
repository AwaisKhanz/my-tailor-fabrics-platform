import { CreditCard } from "lucide-react";
import { Order } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { formatDate, formatPKR } from "@/lib/utils";

interface OrderFinancialSummaryCardProps {
  order: Order;
  onCapturePayment: () => void;
  onReversePayment?: (paymentId: string) => void;
  canCapturePayment?: boolean;
  canReversePayment?: boolean;
  reversingPaymentId?: string | null;
}

export function OrderFinancialSummaryCard({
  order,
  onCapturePayment,
  onReversePayment,
  canCapturePayment = true,
  canReversePayment = true,
  reversingPaymentId = null,
}: OrderFinancialSummaryCardProps) {
  const sortedPayments = [...order.payments].sort(
    (left, right) =>
      new Date(right.paidAt).getTime() - new Date(left.paidAt).getTime(),
  );

  return (
    <Card>
      <CardHeader density="comfortable" align="startResponsive" className="flex-row items-center !rounded-b-none justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
        <SectionHeader
          title="Financial Summary"
          titleVariant="dashboard"
          description="Invoice, received payments, and pending balance."
          icon={
            <SectionIcon tone="info" size="lg">
              <CreditCard className="h-4 w-4 text-primary" />
            </SectionIcon>
          }
        />
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-4">
        <InfoTile tone="secondary" padding="contentLg" className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Subtotal</Label>
            <span className="text-sm font-semibold text-foreground">
              {formatPKR(order.subtotal)}
            </span>
          </div>

          {order.discountAmount > 0 ? (
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Discount{" "}
                {order.discountType === "PERCENTAGE"
                  ? `(${order.discountValue}%)`
                  : ""}
              </Label>
              <span className="text-sm font-semibold text-primary">
                - {formatPKR(order.discountAmount)}
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Net Invoice</Label>
            <span className="text-lg font-bold text-foreground">
              {formatPKR(order.totalAmount)}
            </span>
          </div>
        </InfoTile>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile tone="success">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Paid</Label>
            <p className="mt-1 text-lg font-bold text-primary">
              {formatPKR(order.totalPaid)}
            </p>
          </InfoTile>
          <InfoTile tone="destructive">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Balance</Label>
            <p className="mt-1 text-lg font-bold text-destructive">
              {formatPKR(order.balanceDue)}
            </p>
          </InfoTile>
        </div>

        <InfoTile tone="secondary" padding="content" className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Posted Payments</Label>
            <span className="text-xs font-semibold text-muted-foreground">
              {sortedPayments.length}
            </span>
          </div>

          {sortedPayments.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No payments have been posted yet.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPKR(payment.amount)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </p>
                    {payment.note ? (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {payment.note}
                      </p>
                    ) : null}
                  </div>

                  {canReversePayment && onReversePayment ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reversingPaymentId === payment.id}
                      onClick={() => onReversePayment(payment.id)}
                    >
                      {reversingPaymentId === payment.id
                        ? "Reversing..."
                        : "Reverse"}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </InfoTile>

        {canCapturePayment ? (
          <Button
            variant="default"
            className="h-11 w-full"
            onClick={onCapturePayment}
          >
            Capture Payment
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
