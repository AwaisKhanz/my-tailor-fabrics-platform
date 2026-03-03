import { type ReactNode } from "react";
import { Check, Clock } from "lucide-react";
import { OrderStatus, OrderStatusHistory } from "@tbms/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      key: "Completed & Delivered",
      status: OrderStatus.DELIVERED,
      done: status === OrderStatus.COMPLETED,
      active: status === OrderStatus.DELIVERED,
    },
  ];
}

export function OrderTimelineCard({ status, history }: OrderTimelineCardProps) {
  const timelineSteps = buildTimeline(status);

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader variant="section" density="comfortable">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <CardTitle variant="dashboard">Workflow Timeline</CardTitle>
        </div>
      </CardHeader>

      <CardContent spacing="section">
        <div className="space-y-8">
          {timelineSteps.map((step, index) => {
            const historyEntry = step.status
              ? history.find((item) => item.toStatus === step.status)
              : undefined;
            const isLast = index === timelineSteps.length - 1;

            let statusColor = "bg-muted border-border text-muted-foreground";
            let icon: ReactNode = null;

            if (step.done) {
              statusColor =
                "bg-success border-success text-success-foreground shadow-sm shadow-success/20";
              icon = <Check className="h-3 w-3 stroke-[4]" />;
            } else if (step.active) {
              statusColor =
                "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20";
              icon = <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />;
            }

            return (
              <div key={step.key} className="relative flex items-start gap-5">
                {!isLast ? (
                  <div
                    className={`absolute left-[13px] top-8 h-10 w-[2px] ${step.done ? "bg-success/30" : "bg-border/50"}`}
                  />
                ) : null}

                <div
                  className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${statusColor}`}
                >
                  {icon}
                </div>

                <div className="flex-1 pt-0.5">
                  <p
                    className={`inline-block border-b border-transparent text-xs font-bold uppercase tracking-tight ${step.active ? "border-primary/20 pb-0.5 text-primary" : step.done ? "text-foreground" : "text-muted-foreground opacity-40"}`}
                  >
                    {step.key}
                  </p>

                  {historyEntry ? (
                    <div className="mt-2 space-y-0.5">
                      <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground opacity-60">
                        {new Date(historyEntry.createdAt).toLocaleDateString("en-PK", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        @{" "}
                        {new Date(historyEntry.createdAt).toLocaleTimeString("en-PK", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {historyEntry.note ? (
                        <p className="truncate text-[10px] font-bold text-muted-foreground opacity-80">
                          {historyEntry.note}
                        </p>
                      ) : null}
                    </div>
                  ) : step.active ? (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-1 w-1 animate-ping rounded-full bg-success" />
                      <p className="text-[9px] font-bold uppercase tracking-tight text-success">
                        Current Status
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
