import { CreditCard } from "lucide-react";
import { Order } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import { Separator } from "@tbms/ui/components/separator";
import { cn } from "@/lib/utils";
import { formatDate, formatPKR } from "@/lib/utils";

interface OrderFinancialSummaryCardProps {
  order: Order;
  className?: string;
  onCapturePayment: () => void;
  onReversePayment?: (paymentId: string) => void;
  canCapturePayment?: boolean;
  canReversePayment?: boolean;
  reversingPaymentId?: string | null;
}

export function OrderFinancialSummaryCard({
  order,
  className,
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
    <Card className={cn(className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Financial Summary</CardTitle>
        </div>
        <CardDescription>
          Invoice, received payments, and pending balance.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Subtotal</Label>
            <span className="text-sm font-semibold text-foreground">
              {formatPKR(order.subtotal)}
            </span>
          </div>

          {order.discountAmount > 0 ? (
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Discount{" "}
                {order.discountType === "PERCENTAGE"
                  ? `(${order.discountValue}%)`
                  : ""}
              </Label>
              <span className="text-sm font-semibold text-foreground">
                - {formatPKR(order.discountAmount)}
              </span>
            </div>
          ) : null}

          <Separator className="my-3" />

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Net Invoice</Label>
            <span className="text-lg font-bold text-foreground">
              {formatPKR(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <Label className="text-xs text-muted-foreground">Paid</Label>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatPKR(order.totalPaid)}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <Label className="text-xs text-muted-foreground">Balance</Label>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatPKR(order.balanceDue)}
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Posted Payments</Label>
            <span className="text-xs font-semibold text-muted-foreground">
              {sortedPayments.length}
            </span>
          </div>

          {sortedPayments.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              No payments have been posted yet.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {sortedPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPKR(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </p>
                    {payment.note ? (
                      <p className="truncate text-xs text-muted-foreground">
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
        </div>

        {canCapturePayment ? (
          <Button variant="default" className="h-11 w-full" onClick={onCapturePayment}>
            Capture Payment
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
