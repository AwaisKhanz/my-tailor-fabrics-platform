import { CreditCard } from "lucide-react";
import { Order } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { formatPKR } from "@/lib/utils";

interface OrderFinancialSummaryCardProps {
  order: Order;
  onCapturePayment: () => void;
  canCapturePayment?: boolean;
}

export function OrderFinancialSummaryCard({
  order,
  onCapturePayment,
  canCapturePayment = true,
}: OrderFinancialSummaryCardProps) {
  return (
    <Card variant="shell">
      <CardHeader variant="rowSection" density="comfortable" className="items-start sm:items-center">
        <div className="flex items-center gap-3">
          <SectionIcon size="lg">
            <CreditCard className="h-4 w-4 text-primary" />
          </SectionIcon>
          <div>
            <CardTitle variant="dashboard">Financial Summary</CardTitle>
            <p className="mt-1 text-xs text-text-secondary">Invoice, received payments, and pending balance.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4 p-5 sm:p-6">
        <InfoTile padding="contentLg" className="space-y-3">
          <div className="flex items-center justify-between">
            <Label variant="micro">
              Subtotal
            </Label>
            <span className="text-sm font-semibold text-text-primary">{formatPKR(order.subtotal)}</span>
          </div>

          {order.discountAmount > 0 ? (
            <div className="flex items-center justify-between">
              <Label variant="micro">
                Discount {order.discountType === "PERCENTAGE" ? `(${order.discountValue}%)` : ""}
              </Label>
              <span className="text-sm font-semibold text-success">- {formatPKR(order.discountAmount)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-divider pt-3">
            <Label variant="micro">
              Net Invoice
            </Label>
            <span className="text-lg font-bold text-text-primary">{formatPKR(order.totalAmount)}</span>
          </div>
        </InfoTile>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile tone="success">
            <Label variant="micro">Paid</Label>
            <p className="mt-1 text-lg font-bold text-success">{formatPKR(order.totalPaid)}</p>
          </InfoTile>
          <InfoTile tone="error">
            <Label variant="micro">Balance</Label>
            <p className="mt-1 text-lg font-bold text-destructive">{formatPKR(order.balanceDue)}</p>
          </InfoTile>
        </div>

        {canCapturePayment ? (
          <Button
            variant="premium"
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
