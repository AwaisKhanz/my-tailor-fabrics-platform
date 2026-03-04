import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock3, Pencil, Printer, Share2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailHeaderCardProps {
  orderNumber: string;
  statusLabel: string;
  statusVariant: BadgeProps["variant"];
  createdAtLabel: string;
  dueDateLabel: string;
  canCancel: boolean;
  canEditAction: boolean;
  canPrintReceipt: boolean;
  canShareAction: boolean;
  canCancelAction: boolean;
  sharing: boolean;
  statusLoading: boolean;
  onPrintReceipt: () => void;
  onShareStatus: () => void;
  onCancelOrder: () => void;
  onEditOrder: () => void;
}

export function OrderDetailHeaderCard({
  orderNumber,
  statusLabel,
  statusVariant,
  createdAtLabel,
  dueDateLabel,
  canCancel,
  canEditAction,
  canPrintReceipt,
  canShareAction,
  canCancelAction,
  sharing,
  statusLoading,
  onPrintReceipt,
  onShareStatus,
  onCancelOrder,
  onEditOrder,
}: OrderDetailHeaderCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Order Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {orderNumber}
              </h1>
              <Badge
                variant={statusVariant}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created {createdAtLabel}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Due {dueDateLabel}</span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end",
              canCancel ? "lg:max-w-[760px]" : "lg:max-w-[640px]",
            )}
          >
            {canEditAction ? (
              <Button
                variant="premium"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                onClick={onEditOrder}
              >
                <Pencil className="h-4 w-4" />
                Edit Order
              </Button>
            ) : null}

            {canPrintReceipt ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                onClick={onPrintReceipt}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            ) : null}

            {canShareAction ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                onClick={onShareStatus}
                disabled={sharing}
              >
                <Share2 className="h-4 w-4" />
                Share Status
              </Button>
            ) : null}

            {canCancel && canCancelAction ? (
              <Button
                variant="destructive"
                size="lg"
                className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                onClick={onCancelOrder}
                disabled={statusLoading}
              >
                <XCircle className="h-4 w-4" />
                Cancel Order
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
