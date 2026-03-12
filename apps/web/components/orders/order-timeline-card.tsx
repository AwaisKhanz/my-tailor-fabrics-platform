import { Clock3 } from "lucide-react";
import { OrderStatus, OrderStatusHistory } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { Label } from "@tbms/ui/components/label";
import { ProgressSteps } from "@tbms/ui/components/progress-steps";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { buildOrderProgressSteps } from "@/lib/order-progress-steps";
import { cn } from "@/lib/utils";

interface OrderTimelineCardProps {
  status: OrderStatus;
  history: OrderStatusHistory[];
  className?: string;
}

function formatHistoryTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTimelineCard({
  status,
  history,
  className,
}: OrderTimelineCardProps) {
  const progressSteps = buildOrderProgressSteps(status);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <SectionHeader
          title="Order Timeline"
          titleVariant="dashboard"
          description="Current progression and status events."
          icon={<Clock3 className="h-12 w-14" />}
        />
      </CardHeader>

      <CardContent className="space-y-5">
        <ProgressSteps data={{ steps: progressSteps }} />

        <div className="rounded-md border p-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Recent Events
          </Label>
          <div className="mt-2 space-y-2">
            {history.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-md border p-2">
                <p className="text-xs font-semibold text-foreground">
                  {ORDER_STATUS_CONFIG[entry.toStatus].label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatHistoryTime(entry.createdAt)}
                </p>
              </div>
            ))}

            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No status history found.
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
