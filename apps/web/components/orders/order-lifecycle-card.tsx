import { ArrowRight } from "lucide-react";
import { OrderStatus } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tbms/ui/components/card";
import { FieldLabel } from "@tbms/ui/components/field";
import { InlineLoader } from "@tbms/ui/components/inline-loader";

interface OrderLifecycleCardProps {
  status: OrderStatus;
  statusLoading: boolean;
  onAdvance: (status: OrderStatus) => void;
}

const NEXT_STATUS_CONFIG: Partial<
  Record<
    OrderStatus,
    {
      next: OrderStatus;
      label: string;
      helper: string;
      variant: "default" | "outline";
    }
  >
> = {
  [OrderStatus.NEW]: {
    next: OrderStatus.IN_PROGRESS,
    label: "Begin Production",
    helper: "Start tailoring workflow for all assigned pieces.",
    variant: "default",
  },
  [OrderStatus.IN_PROGRESS]: {
    next: OrderStatus.READY,
    label: "Mark Ready",
    helper: "Move order to ready once work is completed.",
    variant: "outline",
  },
  [OrderStatus.READY]: {
    next: OrderStatus.DELIVERED,
    label: "Mark Delivered",
    helper: "Confirm handover to customer.",
    variant: "outline",
  },
  [OrderStatus.DELIVERED]: {
    next: OrderStatus.COMPLETED,
    label: "Complete Order",
    helper: "Close lifecycle after final checks.",
    variant: "default",
  },
};

export function OrderLifecycleCard({
  status,
  statusLoading,
  onAdvance,
}: OrderLifecycleCardProps) {
  if (status === OrderStatus.CANCELLED || status === OrderStatus.COMPLETED) {
    return null;
  }

  const nextConfig = NEXT_STATUS_CONFIG[status];
  if (!nextConfig) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FieldLabel as="span">Lifecycle Action</FieldLabel>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Advance this order to the next stage.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-md border p-3 text-xs text-muted-foreground">
          {nextConfig.helper}
        </div>

        <Button
          variant={nextConfig.variant}
          className="h-11 w-full"
          onClick={() => onAdvance(nextConfig.next)}
          disabled={statusLoading}
        >
          {statusLoading ? (
            <InlineLoader label="Updating order status" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {nextConfig.label}
        </Button>
      </CardContent>
    </Card>
  );
}
