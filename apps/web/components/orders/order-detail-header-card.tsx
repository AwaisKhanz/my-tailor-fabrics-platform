import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MetaPill } from "@/components/ui/meta-pill";
import { Heading } from "@/components/ui/typography";
import {
  CalendarDays,
  Clock3,
  Pencil,
  Printer,
  Share2,
  XCircle,
} from "lucide-react";
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
  const actionButtons = [
    canEditAction
      ? {
          key: "edit",
          label: "Edit Order",
          icon: Pencil,
          variant: "default" as const,
          onClick: onEditOrder,
          disabled: false,
        }
      : null,
    canPrintReceipt
      ? {
          key: "receipt",
          label: "Print Receipt",
          icon: Printer,
          variant: "outline" as const,
          onClick: onPrintReceipt,
          disabled: false,
        }
      : null,
    canShareAction
      ? {
          key: "share",
          label: "Share Status",
          icon: Share2,
          variant: "outline" as const,
          onClick: onShareStatus,
          disabled: sharing,
        }
      : null,
    canCancel && canCancelAction
      ? {
          key: "cancel",
          label: "Cancel Order",
          icon: XCircle,
          variant: "destructive" as const,
          onClick: onCancelOrder,
          disabled: statusLoading,
        }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <Card>
      <CardContent spacing="section" padding="inset" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Order Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <Heading
                as="h1"
                variant="page"
                className="font-semibold sm:text-4xl"
              >
                {orderNumber}
              </Heading>
              <Badge
                variant={statusVariant}
                className="px-2.5 py-1 text-xs font-bold uppercase "
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <MetaPill>
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created {createdAtLabel}</span>
              </MetaPill>
              <MetaPill>
                <Clock3 className="h-3.5 w-3.5" />
                <span>Due {dueDateLabel}</span>
              </MetaPill>
            </div>
          </div>

          <div
            className={cn(
              "flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end",
              canCancel ? "lg:max-w-[760px]" : "lg:max-w-[640px]",
            )}
          >
            {actionButtons.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  variant={action.variant}
                  size="lg"
                  className="w-full justify-center sm:w-auto sm:min-w-[180px]"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
