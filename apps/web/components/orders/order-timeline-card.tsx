import { Check, Clock3, Dot } from "lucide-react";
import { type ReactNode } from "react";
import { OrderStatus, OrderStatusHistory } from "@tbms/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface TimelineStep {
  key: string;
  status?: OrderStatus;
  done: boolean;
  active: boolean;
}

interface OrderTimelineCardProps {
  status: OrderStatus;
  history: OrderStatusHistory[];
}

function buildTimeline(status: OrderStatus): TimelineStep[] {
  const inProgressDoneStatuses = [
    OrderStatus.IN_PROGRESS,
    OrderStatus.READY,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED,
  ];
  const readyDoneStatuses = [
    OrderStatus.READY,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED,
  ];

  return [
    { key: "Order Created", done: true, active: false },
    { key: "Measurements Taken", done: true, active: false },
    {
      key: "In Progress",
      status: OrderStatus.IN_PROGRESS,
      done: inProgressDoneStatuses.includes(status),
      active: status === OrderStatus.IN_PROGRESS,
    },
    {
      key: "Ready for Trial",
      status: OrderStatus.READY,
      done: readyDoneStatuses.includes(status),
      active: status === OrderStatus.READY,
    },
    {
      key: "Delivered",
      status: OrderStatus.DELIVERED,
      done: status === OrderStatus.COMPLETED,
      active: status === OrderStatus.DELIVERED,
    },
  ];
}

function formatHistoryTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTimelineCard({ status, history }: OrderTimelineCardProps) {
  const timelineSteps = buildTimeline(status);

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardHeader variant="rowSection" density="comfortable" className="items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Clock3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle variant="dashboard">Order Timeline</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Current progression and status events.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5 sm:p-6">
        <div className="space-y-3">
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            let markerClass = "border-border bg-muted text-muted-foreground";
            let markerIcon: ReactNode = <Dot className="h-4 w-4" />;

            if (step.done) {
              markerClass = "border-success bg-success text-success-foreground";
              markerIcon = <Check className="h-3.5 w-3.5" />;
            } else if (step.active) {
              markerClass = "border-primary bg-primary text-primary-foreground";
              markerIcon = <Dot className="h-4 w-4 animate-pulse" />;
            }

            return (
              <div key={step.key} className="relative flex gap-3">
                {!isLast ? (
                  <span
                    className={`absolute left-[11px] top-6 h-6 w-px ${step.done ? "bg-success/50" : "bg-border"}`}
                  />
                ) : null}

                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border ${markerClass}`}>
                  {markerIcon}
                </div>

                <div className="pt-0.5">
                  <p className={`text-xs font-semibold ${step.active ? "text-primary" : "text-foreground"}`}>
                    {step.key}
                  </p>
                  {step.active ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Current stage</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Recent Events</Label>
          <div className="mt-2 space-y-2">
            {history.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-md border border-border/60 bg-background/60 px-2.5 py-2">
                <p className="text-xs font-semibold text-foreground">
                  {entry.toStatus.replace("_", " ")}
                </p>
                <p className="text-[11px] text-muted-foreground">{formatHistoryTime(entry.createdAt)}</p>
              </div>
            ))}

            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No status history found.</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
