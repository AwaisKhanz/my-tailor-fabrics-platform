import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Calendar, Clock, Plus, Printer, Share2, XCircle } from "lucide-react";

interface OrderDetailHeaderCardProps {
  orderNumber: string;
  statusLabel: string;
  statusVariant: BadgeProps["variant"];
  createdAtLabel: string;
  dueDateLabel: string;
  canCancel: boolean;
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
  sharing,
  statusLoading,
  onPrintReceipt,
  onShareStatus,
  onCancelOrder,
  onEditOrder,
}: OrderDetailHeaderCardProps) {
  return (
    <Card className="overflow-hidden border-border shadow-sm ring-1 ring-border/50">
      <CardContent className="flex flex-col justify-between gap-6 bg-muted/5 px-6 py-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <Typography as="h1" variant="pageTitle" className="text-4xl">
              {orderNumber}
            </Typography>
            <Badge
              variant={statusVariant}
              size="xs"
              className="uppercase font-bold ring-1 ring-border"
            >
              {statusLabel}
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Calendar className="h-3 w-3 opacity-40" /> {createdAtLabel}
            <span className="opacity-20">|</span>
            <Clock className="h-3 w-3 opacity-40" /> Due: {dueDateLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-xs font-bold shadow-sm ring-1 ring-border"
            onClick={onPrintReceipt}
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-xs font-bold shadow-sm ring-1 ring-border"
            onClick={onShareStatus}
            disabled={sharing}
          >
            <Share2 className="h-4 w-4" /> Share Status
          </Button>

          {canCancel ? (
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-xs font-bold text-destructive hover:bg-destructive/10"
              onClick={onCancelOrder}
              disabled={statusLoading}
            >
              <XCircle className="h-4 w-4" /> Cancel Order
            </Button>
          ) : null}

          <Button
            variant="premium"
            size="lg"
            className="gap-2 text-xs font-bold shadow-lg shadow-primary/20"
            onClick={onEditOrder}
          >
            <Plus className="h-4 w-4" /> Edit Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
