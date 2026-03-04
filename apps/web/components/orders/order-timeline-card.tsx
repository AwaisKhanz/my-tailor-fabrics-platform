import { Check, Clock3, Dot } from "lucide-react";
import { type ReactNode } from "react";
import { OrderStatus, OrderStatusHistory } from "@tbms/shared-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";

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
    <Card variant="premium">
      <CardHeader variant="rowSection" density="comfortable" align="startResponsive">
        <div className="flex items-center gap-3">
          <SectionIcon tone="infoSoft" size="lg">
            <Clock3 className="h-4 w-4 text-primary" />
          </SectionIcon>
          <div>
            <CardTitle variant="dashboard">Order Timeline</CardTitle>
            <CardDescription variant="header">
              Current progression and status events.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <div className="space-y-3">
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            let markerClass = "border-divider bg-pending-muted text-text-secondary";
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
                    className={`absolute left-[11px] top-6 h-6 w-px ${step.done ? "bg-success/50" : "bg-divider"}`}
                  />
                ) : null}

                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border ${markerClass}`}>
                  {markerIcon}
                </div>

                <div className="pt-0.5">
                  <p className={`text-xs font-semibold ${step.active ? "text-primary" : "text-text-primary"}`}>
                    {step.key}
                  </p>
                  {step.active ? (
                    <p className="mt-0.5 text-[11px] text-text-secondary">Current stage</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <InfoTile tone="elevatedSoft" padding="content">
          <Label variant="micro">Recent Events</Label>
          <div className="mt-2 space-y-2">
            {history.slice(0, 4).map((entry) => (
              <InfoTile key={entry.id} tone="surface" padding="sm" className="rounded-md">
                <p className="text-xs font-semibold text-text-primary">
                  {entry.toStatus.replace("_", " ")}
                </p>
                <p className="text-[11px] text-text-secondary">{formatHistoryTime(entry.createdAt)}</p>
              </InfoTile>
            ))}

            {history.length === 0 ? (
              <p className="text-xs text-text-secondary">No status history found.</p>
            ) : null}
          </div>
        </InfoTile>
      </CardContent>
    </Card>
  );
}
