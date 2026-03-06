import { ArrowRight, Loader2 } from "lucide-react";
import { OrderStatus } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader density="comfortable" className="border-b !rounded-b-none border-border bg-muted/40 px-6 py-4">
        <CardTitle className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Lifecycle Action</CardTitle>
        <p className="text-xs text-muted-foreground">
          Advance this order to the next stage.
        </p>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-3">
        <p className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
          {nextConfig.helper}
        </p>

        <Button
          variant={nextConfig.variant}
          className="h-11 w-full"
          onClick={() => onAdvance(nextConfig.next)}
          disabled={statusLoading}
        >
          {statusLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {nextConfig.label}
        </Button>
      </CardContent>
    </Card>
  );
}
